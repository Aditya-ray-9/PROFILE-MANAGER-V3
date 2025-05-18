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
let databaseUrl = process.env.DATABASE_URL || process.env['DATABASE_URL'];
console.log(`Database URL available: ${!!databaseUrl}`);

// Print the hostname part of the URL for debugging
if (databaseUrl) {
  try {
    // Extract just the hostname for debugging
    const urlObj = new URL(databaseUrl);
    console.log(`Database hostname: ${urlObj.hostname}`);
    console.log("Database connection will use Supabase PostgreSQL");
  } catch (e) {
    console.error("Error parsing DATABASE_URL:", e);
  }
}

try {
  if (databaseUrl) {
    console.log("Attempting to connect to Supabase PostgreSQL database...");
    
    // Create a PostgreSQL connection specifically for Supabase
    queryClient = postgres(databaseUrl, { 
      ssl: 'require',  // Supabase requires SSL
      max: 10,         // Connection pool size
      idle_timeout: 30,
      connect_timeout: 10, // Longer timeout for initial connection
      connection: {
        application_name: 'profile-management-app'
      }
    });
    
    // Create a Drizzle instance with our schema
    db = drizzle(queryClient, { schema });
    
    // Test the connection with a simple query
    const testResult = await queryClient`SELECT 1 as test`;
    
    if (testResult && testResult.length > 0) {
      isDatabaseConnected = true;
      console.log("Supabase PostgreSQL database connection established successfully");
    } else {
      throw new Error("Database connection test failed");
    }
  } else {
    console.log("No DATABASE_URL provided, database features will be disabled");
  }
} catch (error) {
  console.error("Failed to connect to Supabase PostgreSQL database:", error);
  console.error("Error details:", error instanceof Error ? error.message : String(error));
  isDatabaseConnected = false;
}

// Export the database connection variables
export { queryClient, db };