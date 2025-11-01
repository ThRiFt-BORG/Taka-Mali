import { defineConfig } from "drizzle-kit";

const isProd = process.env.NODE_ENV === "production";
const connectionString = isProd
  ? process.env.DATABASE_URL
  : process.env.LOCAL_DATABASE_URL;

if (!connectionString) {
  throw new Error("No database connection string found");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
