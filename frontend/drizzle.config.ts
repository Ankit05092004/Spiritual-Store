import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Load .env.local first (takes precedence), fall back to .env
config({ path: ".env.local" });
config({ path: ".env" }); // no-op if variable already set via .env.local

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for database configuration");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
