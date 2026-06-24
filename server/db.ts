import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _pool: mysql.Pool | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getPool() {
  if (!_pool && process.env.DATABASE_URL) {
    _pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
    });
  }
  return _pool;
}

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = getPool();
      if (!pool) return null;
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: {
  openId?: string | null;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  lastSignedIn?: Date;
  role?: "user" | "admin";
}): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const openId = user.openId;
  if (!openId) {
    throw new Error("User openId is required for upsert");
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.openId, openId))
      .limit(1);

    const updateSet: Record<string, unknown> = {
      lastSignedIn: user.lastSignedIn ?? new Date(),
      updatedAt: new Date(),
    };

    if (user.name !== undefined) updateSet.name = user.name ?? null;
    if (user.email !== undefined) updateSet.email = user.email ?? null;
    if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod ?? null;
    if (user.role !== undefined) updateSet.role = user.role;

    if (existing.length > 0) {
      await db.update(users).set(updateSet).where(eq(users.openId, openId));
    } else {
      const generatedUsername = `user_${openId.slice(0, 12)}`;
      const role = openId === ENV.ownerOpenId ? "admin" : (user.role ?? "user");
      await db.insert(users).values({
        openId,
        username: generatedUsername,
        fullName: user.name ?? generatedUsername,
        name: user.name ?? null,
        email: user.email ?? null,
        loginMethod: user.loginMethod ?? null,
        role,
        lastSignedIn: user.lastSignedIn ?? new Date(),
        credits: 0,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}
