/**
 * Script para preparar o banco PostgreSQL/Neon e criar o admin inicial.
 * Execute: node server/seed-admin.mjs
 */
import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const { Client } = pg;

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "shadow_salt_v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não configurada.");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});

await client.connect();

try {
  await client.query(`DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('user', 'admin');
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`);

  await client.query(`DO $$ BEGIN
    CREATE TYPE key_duration AS ENUM ('1', '3', '7', '30');
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`);

  await client.query(`DO $$ BEGIN
    CREATE TYPE key_status AS ENUM ('available', 'used');
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;`);

  await client.query(`CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    "openId" VARCHAR(64) UNIQUE,
    username VARCHAR(64) NOT NULL UNIQUE,
    "passwordHash" VARCHAR(255),
    "fullName" VARCHAR(255) NOT NULL DEFAULT '',
    credits INTEGER NOT NULL DEFAULT 0,
    name TEXT,
    email VARCHAR(320),
    "loginMethod" VARCHAR(64),
    role user_role NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "lastSignedIn" TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );`);

  await client.query(`CREATE TABLE IF NOT EXISTS keys (
    id SERIAL PRIMARY KEY,
    "keyValue" VARCHAR(128) NOT NULL UNIQUE,
    duration key_duration NOT NULL,
    status key_status NOT NULL DEFAULT 'available',
    "usedBy" INTEGER,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "expiresAt" TIMESTAMPTZ
  );`);

  const hash = await hashPassword("admin123");

  await client.query(
    `INSERT INTO users (username, "passwordHash", "fullName", credits, role, "lastSignedIn")
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (username)
     DO UPDATE SET "passwordHash" = EXCLUDED."passwordHash", role = EXCLUDED.role, "updatedAt" = NOW()`,
    ["admin", hash, "Administrador", 0, "admin"]
  );

  console.log("✅ Banco preparado e admin criado: username=admin, senha=admin123");
} catch (err) {
  console.error("❌ Erro:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
