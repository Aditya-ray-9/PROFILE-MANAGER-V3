import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a PostgreSQL connection
export const queryClient = postgres(process.env.DATABASE_URL, { 
  ssl: 'require',
  max: 10,
  prepare: false
});

// Create a Drizzle instance with our schema
export const db = drizzle(queryClient, { schema });

// Export SQL for raw queries
export { sql } from "drizzle-orm";