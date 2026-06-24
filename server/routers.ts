import { TRPCError } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import * as jose from "jose";
import { z } from "zod";
import { keys, users } from "../drizzle/schema";
import { getDb } from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// ─── helpers ────────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "shadow-secret-key-change-in-production"
);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "shadow_salt_v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

async function signJwt(payload: { userId: number; role: string; username: string }) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

function generateKeyValue(duration: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let random = "";
  for (let i = 0; i < 12; i++) {
    random += chars[Math.floor(Math.random() * chars.length)];
  }
  return `proxyff-${duration}days-${random}`;
}

const CREDIT_COSTS: Record<string, number> = {
  "1": 10,
  "7": 35,
  "30": 55,
};

// ─── admin-only guard ────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores." });
  }
  return next({ ctx });
});

// ─── router ─────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => {
      const u = opts.ctx.user;
      if (!u) return null;
      // Never expose passwordHash to the client
      const { passwordHash: _ph, ...safeUser } = u;
      return safeUser;
    }),

    login: publicProcedure
      .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível." });

        const result = await db
          .select()
          .from(users)
          .where(eq(users.username, input.username))
          .limit(1);

        const user = result[0];
        if (!user || !user.passwordHash) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha inválidos." });
        }
        
        // Obter IP do cliente
        let ipAddress = (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
                       (ctx.req.headers['cf-connecting-ip'] as string) ||
                       ctx.req.socket?.remoteAddress || 
                       'unknown';
        
        // Verificar se IP está bloqueado PARA ESTE USUÁRIO
        try {
          const connection = db.$client;
          // Normalizar IP (remover ::ffff: prefix para IPv4 mapeado)
          let normalizedIp = ipAddress;
          if (normalizedIp.startsWith('::ffff:')) {
            normalizedIp = normalizedIp.substring(7);
          }
          
          const blockedResult = await connection.execute(
            `SELECT id FROM ipBlocks WHERE (ip = ? OR ip = ?) LIMIT 1`,
            [ipAddress, normalizedIp]
          );
          const blockedIps = ((blockedResult as unknown) as any[])[0] || [];
          if (blockedIps.length > 0) {
            throw new TRPCError({ code: "FORBIDDEN", message: "Seu IP foi bloqueado. Contate o administrador." });
          }
        } catch (error: any) {
          if (error.code === "FORBIDDEN") throw error;
          console.error('Erro ao verificar IP bloqueado:', error);
        }

        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Usuário ou senha inválidos." });
        }

        // Registrar auditoria
        const userAgent = (ctx.req.headers['user-agent'] || 'unknown').substring(0, 500);
        
        try {
          const connection = db.$client;
          await connection.execute(
            `INSERT INTO \`loginAudit\` (userId, username, ipAddress, userAgent, status) VALUES (?, ?, ?, ?, ?)`,
            [user.id, user.username, ipAddress, userAgent, 'success']
          );
        } catch (auditError) {
          console.error('Erro ao registrar auditoria:', auditError);
        }

        const token = await signJwt({ userId: user.id, role: user.role, username: user.username });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        return { success: true, role: user.role, user: { id: user.id, username: user.username, fullName: user.fullName, credits: user.credits, role: user.role } };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── admin: users ──────────────────────────────────────────────────────────

  adminUsers: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      return db
        .select({ id: users.id, username: users.username, fullName: users.fullName, credits: users.credits, role: users.role, createdAt: users.createdAt })
        .from(users)
        .where(eq(users.role, "user"));
    }),

    create: adminProcedure
      .input(
        z.object({
          username: z.string().min(3).max(32),
          password: z.string().min(4),
          fullName: z.string().min(1),
          credits: z.number().int().min(0).default(0),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, input.username)).limit(1);
        if (existing.length > 0) throw new TRPCError({ code: "CONFLICT", message: "Nome de usuário já existe." });

        const passwordHash = await hashPassword(input.password);
        const openId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await db.insert(users).values({
          openId,
          username: input.username,
          passwordHash,
          fullName: input.fullName,
          credits: input.credits,
          role: "user",
          lastSignedIn: new Date(),
        });
        return { success: true };
      }),

    updateCredits: adminProcedure
      .input(z.object({ userId: z.number(), credits: z.number().int().min(0) }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.update(users).set({ credits: input.credits }).where(eq(users.id, input.userId));
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(users).where(and(eq(users.id, input.userId), eq(users.role, "user")));
        return { success: true };
      }),
  }),

  // ─── admin: keys ───────────────────────────────────────────────────────────

  adminKeys: router({
    list: adminProcedure
      .input(z.object({ duration: z.enum(["1", "7", "30"]).optional() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const conditions = input.duration ? [eq(keys.duration, input.duration)] : [];
        return db
          .select()
          .from(keys)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(keys.createdAt);
      }),

    add: adminProcedure
      .input(
        z.object({
          keyValues: z.array(z.string().min(1)).min(1).max(500),
          duration: z.enum(["1", "7", "30"]),
        })
      )
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const toInsert = input.keyValues
          .map((kv) => kv.trim())
          .filter((kv) => kv.length > 0)
          .map((keyValue) => ({
            keyValue,
            duration: input.duration,
            status: "available" as const,
          }));

        if (toInsert.length === 0) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Nenhuma key válida fornecida." });
        }

        let added = 0;
        let skipped = 0;

        for (const row of toInsert) {
          try {
            await db.insert(keys).values(row);
            added++;
          } catch (error: any) {
            skipped++;
            console.error(`Erro ao inserir key ${row.keyValue}:`, error.message);
          }
        }

        return { success: true, added, skipped };
      }),

    delete: adminProcedure
      .input(z.object({ keyId: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        await db.delete(keys).where(eq(keys.id, input.keyId));
        return { success: true };
      }),

    stats: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const durations = ["1", "7", "30"] as const;
      const result: Record<string, { total: number; available: number; used: number }> = {};

      for (const d of durations) {
        const rows = await db
          .select({ status: keys.status, count: sql<number>`count(*)` })
          .from(keys)
          .where(eq(keys.duration, d))
          .groupBy(keys.status);

        let total = 0, available = 0, used = 0;
        for (const row of rows) {
          const n = Number(row.count);
          total += n;
          if (row.status === "available") available = n;
          else used = n;
        }
        result[d] = { total, available, used };
      }
      return result;
    }),
  }),

  // ─── user: generator ───────────────────────────────────────────────────────

  generator: router({
    generate: protectedProcedure
      .input(
        z.object({
          duration: z.enum(["1", "7", "30"]),
          quantity: z.number().int().min(1).max(50),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        const cost = CREDIT_COSTS[input.duration]! * input.quantity;

        // Fetch current user credits
        const userRows = await db.select({ credits: users.credits }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
        const currentCredits = userRows[0]?.credits ?? 0;

        if (currentCredits < cost) {
          throw new TRPCError({ code: "BAD_REQUEST", message: `Créditos insuficientes. Necessário: ${cost}, Disponível: ${currentCredits}` });
        }

        // Find available keys from stock
        const availableKeys = await db
          .select()
          .from(keys)
          .where(and(eq(keys.duration, input.duration), eq(keys.status, "available")))
          .limit(input.quantity);

        const now = new Date();
        const durationDays = parseInt(input.duration);
        const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
        const generatedKeyValues: string[] = [];

        // Only use keys from stock - no generation
        if (availableKeys.length < input.quantity) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "O gerador está sem keys, aguarde",
          });
        }

        // Mark keys as used
        for (const key of availableKeys) {
          await db.update(keys).set({ status: "used", usedBy: ctx.user.id, expiresAt }).where(eq(keys.id, key.id));
          generatedKeyValues.push(key.keyValue);
        }

        await db.update(users).set({ credits: currentCredits - cost }).where(eq(users.id, ctx.user.id));

        return {
          success: true,
          keys: generatedKeyValues,
          creditsUsed: cost,
          creditsRemaining: currentCredits - cost,
        };
      }),

    dashboard: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const userRows = await db.select({ credits: users.credits }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const credits = userRows[0]?.credits ?? 0;

      const usedKeysRows = await db
        .select({ count: sql<number>`count(*)` })
        .from(keys)
        .where(and(eq(keys.usedBy, ctx.user.id), eq(keys.status, "used")));
      const keysGenerated = Number(usedKeysRows[0]?.count ?? 0);

      // Calculate credits spent (sum of costs per key)
      const spentRows = await db
        .select({ duration: keys.duration, count: sql<number>`count(*)` })
        .from(keys)
        .where(and(eq(keys.usedBy, ctx.user.id), eq(keys.status, "used")))
        .groupBy(keys.duration);

      let creditsSpent = 0;
      for (const row of spentRows) {
        creditsSpent += (CREDIT_COSTS[row.duration] ?? 0) * Number(row.count);
      }

      return { credits, keysGenerated, creditsSpent };
    }),
  }),

  // ─── admin: audit ──────────────────────────────────────────────────────────

  adminAudit: router({
    listLogins: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      try {
        const connection = db.$client;
        const result = await connection.execute(
          `SELECT id, userId, username, ipAddress, userAgent, loginTime, status FROM \`loginAudit\` ORDER BY loginTime DESC LIMIT 500`
        );
        return ((result as unknown) as any[])[0] || [];
      } catch (error) {
        console.error('Erro ao listar auditoria:', error);
        return [];
      }
    }),

    deleteByIp: adminProcedure
      .input(z.object({ ipAddress: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          const connection = db.$client;
          const result = await connection.execute(
            `DELETE FROM \`loginAudit\` WHERE ipAddress = ?`,
            [input.ipAddress]
          );
          return { success: true, deletedCount: (((result as unknown) as any[])[1] as any)?.affectedRows || 0 };
        } catch (error) {
          console.error('Erro ao deletar auditoria:', error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao deletar registros" });
        }
      }),

    deleteById: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          const connection = db.$client;
          await connection.execute(
            `DELETE FROM \`loginAudit\` WHERE id = ?`,
            [input.id]
          );
          return { success: true };
        } catch (error) {
          console.error('Erro ao deletar auditoria:', error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao deletar registro" });
        }
      }),

    blockIp: adminProcedure
      .input(z.object({ ipAddress: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          const connection = db.$client;
          await connection.execute(
            `INSERT INTO ipBlocks (ip, userId) VALUES (?, ?) ON DUPLICATE KEY UPDATE blockedAt = NOW()`,
            [input.ipAddress, ctx.user?.id || null]
          );
          return { success: true };
        } catch (error) {
          console.error('Erro ao bloquear IP:', error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao bloquear IP" });
        }
      }),

    unblockIp: adminProcedure
      .input(z.object({ ipAddress: z.string() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        try {
          const connection = db.$client;
          await connection.execute(
            `DELETE FROM ipBlocks WHERE ip = ?`,
            [input.ipAddress]
          );
          return { success: true };
        } catch (error) {
          console.error('Erro ao desbloquear IP:', error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao desbloquear IP" });
        }
      }),

    getBlockedIps: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      try {
        const connection = db.$client;
        const result = await connection.execute(`SELECT ip AS ipAddress, blockedAt FROM ipBlocks ORDER BY blockedAt DESC`);
        return ((result as unknown) as any[])[0] || [];
      } catch (error) {
        console.error('Erro ao listar IPs bloqueados:', error);
        return [];
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
