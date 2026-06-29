/**
 * Script para criar o admin inicial no MySQL.
 * Execute no console do Railway: node server/seed-admin-mysql.mjs
 */
import mysql from "mysql2/promise";

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.DRIZZLE_DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não configurada.");
  process.exit(1);
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "shadow_salt_v1");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

const connection = await mysql.createConnection(DATABASE_URL);

try {
  const hash = await hashPassword("admin123");
  const openId = `local-admin-${Date.now()}`;

  await connection.execute(
    `INSERT INTO users (openId, username, passwordHash, fullName, credits, role, lastSignedIn, createdAt, updatedAt)
     VALUES (?, 'admin', ?, 'Administrador', 0, 'admin', NOW(), NOW(), NOW())
     ON DUPLICATE KEY UPDATE passwordHash = VALUES(passwordHash), role = 'admin', updatedAt = NOW()`,
    [openId, hash]
  );

  console.log("✅ Admin criado com sucesso!");
  console.log("   Username: admin");
  console.log("   Senha: admin123");
} catch (err) {
  console.error("❌ Erro:", err.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}
