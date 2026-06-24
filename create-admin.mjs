import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { users } from "./drizzle/schema.ts";

// Hash da senha "thzin123" com salt "shadow_salt_v1"
const passwordHash = "62b5d8aadb8a68c929048b59823ad58e201f59fc8eab786db5332760754ebfc3";

async function createAdmin() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  try {
    console.log("Criando usuário admin...");
    
    await db.insert(users).values({
      username: "admin123",
      passwordHash,
      fullName: "Admin User",
      credits: 1000,
      role: "admin",
      lastSignedIn: new Date(),
    }).onConflictDoNothing();

    console.log("✅ Usuário admin criado com sucesso!");
    console.log("Login: admin123");
    console.log("Senha: thzin123");
  } catch (error) {
    console.error("❌ Erro ao criar admin:", error);
  } finally {
    await connection.end();
  }
}

createAdmin();
