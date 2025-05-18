import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";
import { sql } from "drizzle-orm";

// Variable to track if we're using a real database
export let isDatabaseConnected = false;

// Export SQL for raw queries
export { sql };

// Set up database connection if URL is available
let queryClient: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle> | null = null;

// Get DATABASE_URL from environment or from process directly
// This ensures we can access it in Replit even if not loaded through dotenv
const databaseUrl = process.env.DATABASE_URL || process.env['DATABASE_URL'];
console.log(`Database URL available: ${!!databaseUrl}`);

try {
  if (databaseUrl) {
    console.log("Attempting to connect to PostgreSQL database...");
    
    // Create a PostgreSQL connection
    queryClient = postgres(databaseUrl, { 
      ssl: 'require',
      max: 10,
      prepare: false
    });
    
    // Create a Drizzle instance with our schema
    db = drizzle(queryClient, { schema });
    
    isDatabaseConnected = true;
    console.log("PostgreSQL database connection established");
  } else {
    console.log("No DATABASE_URL provided, database features will be disabled");
  }
} catch (error) {
  console.error("Failed to connect to PostgreSQL database:", error);
  isDatabaseConnected = false;
}

// Export the database connection variables
export { queryClient, db };