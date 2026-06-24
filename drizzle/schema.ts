import {
  int,
  mysqlTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  fullName: varchar("fullName", { length: 255 }).notNull().default(""),
  credits: int("credits").notNull().default(0),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: varchar("role", { length: 20 }).default("user").notNull(),
  registeredIp: varchar("registeredIp", { length: 45 }),
  isIpBlocked: int("isIpBlocked").notNull().default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const keys = mysqlTable("keys", {
  id: serial("id").primaryKey(),
  keyValue: varchar("keyValue", { length: 128 }).notNull().unique(),
  duration: varchar("duration", { length: 10 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("available"),
  usedBy: int("usedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
});

export const ipBlocks = mysqlTable("ipBlocks", {
  id: serial("id").primaryKey(),
  ip: varchar("ip", { length: 45 }).notNull().unique(),
  userId: int("userId"),
  reason: text("reason"),
  blockedAt: timestamp("blockedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Key = typeof keys.$inferSelect;
export type InsertKey = typeof keys.$inferInsert;
export type IpBlock = typeof ipBlocks.$inferSelect;
export type InsertIpBlock = typeof ipBlocks.$inferInsert;
