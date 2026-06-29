import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load .env file if it exists (local dev), but don't fail if it doesn't (Railway)
config({ path: ".env" });
config({ path: ".env.local" });

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DRIZZLE_DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.MYSQL_PRIVATE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
