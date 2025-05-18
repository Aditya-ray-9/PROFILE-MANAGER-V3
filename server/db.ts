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

// Initialize the database
function initDatabase() {
  // Use Neon PostgreSQL database URI from environment
  const databaseUrl = process.env.NEON_DATABASE_URL || "postgresql://neondb_owner:npg_XP8xBDvj9gIZ@ep-noisy-poetry-a4yk8qnu-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require";
  console.log(`Database URL available: ${!!databaseUrl}`);

  // Print the hostname part of the URL for debugging
  if (databaseUrl) {
    try {
      // Extract just the hostname for debugging
      const urlObj = new URL(databaseUrl);
      console.log(`Database hostname: ${urlObj.hostname}`);
      console.log("Database connection will use Replit PostgreSQL");
    } catch (e) {
      console.error("Error parsing DATABASE_URL:", e);
    }
  }

  // Immediately establish the connection if possible
  if (databaseUrl) {
    console.log("Attempting to connect to PostgreSQL database...");
    
    try {
      // Create a PostgreSQL connection
      queryClient = postgres(databaseUrl, { 
        max: 10,         // Connection pool size
        idle_timeout: 30,
        connect_timeout: 10 // Longer timeout for initial connection
      });
      
      // Create a Drizzle instance with our schema
      db = drizzle(queryClient, { schema });
      
      // Set the connection status flag
      isDatabaseConnected = true;
      console.log("PostgreSQL database connection established successfully");
    } catch (error) {
      console.error("Failed to connect to PostgreSQL database:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      isDatabaseConnected = false;
    }
  } else {
    console.log("No DATABASE_URL provided, database features will be disabled");
  }
}

// Initialize database connection
initDatabase();

// Export the database connection variables
export { queryClient, db };