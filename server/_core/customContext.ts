/**
 * Custom authentication context that validates our own JWT tokens
 * instead of relying on Manus OAuth flow.
 */
import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { parse as parseCookieHeader } from "cookie";
import { COOKIE_NAME } from "@shared/const";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "shadow-secret-key-change-in-production"
);

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: {
    id: number;
    openId: string | null;
    username: string;
    fullName: string;
    credits: number;
    name: string | null;
    email: string | null;
    loginMethod: string | null;
    role: "user" | "admin";
    createdAt: Date;
    updatedAt: Date;
    lastSignedIn: Date;
    passwordHash: string | null;
  } | null;
};

export async function createCustomContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: TrpcContext["user"] = null;

  try {
    const cookieHeader = opts.req.headers.cookie ?? "";
    const cookies = parseCookieHeader(cookieHeader);
    const token = cookies[COOKIE_NAME];

    if (token) {
      const { payload } = await jwtVerify(token, JWT_SECRET, { algorithms: ["HS256"] });
      const userId = payload.userId as number | undefined;

      if (userId) {
        const db = await getDb();
        if (db) {
          const result = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);
          if (result[0]) {
            user = result[0];
          }
        }
      }
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
