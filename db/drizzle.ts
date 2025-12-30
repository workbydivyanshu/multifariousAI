import { drizzle } from "drizzle-orm/node-postgres";

// Database connection is optional for local-only mode
// If DATABASE_URL is not set, db will be null and all data persists in localStorage

let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  try {
    db = drizzle(process.env.DATABASE_URL);
  } catch (error) {
    console.warn("Failed to connect to database:", error);
    db = null;
  }
}

export function isDbConnected(): boolean {
  return db !== null;
}

export default db;