import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { sql } from "./db";
import { 
  insertProfileSchema, 
  profileSearchSchema, 
  userPreferencesSchema,
  loginSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Extended query schema with pagination
const paginatedSearchSchema = profileSearchSchema.extend({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(6)
});

// Initialize database tables
async function initDatabase() {
  try {
    // Create profiles table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        profile_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        search_id TEXT,
        description TEXT NOT NULL,
        photo_url TEXT,
        documents JSONB DEFAULT '[]'
      )
    `;

    // Create settings table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value JSONB NOT NULL
      )
    `;
    
    // Create users table for authentication
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Insert admin user if not exists
    await sql`
      INSERT INTO users (username, password, role)
      VALUES ('admin', 'A9810625562', 'admin')
      ON CONFLICT (username) DO NOTHING
    `;
    
    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
  }
}

// Authentication middleware
const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  
  // Simple session-based auth (in production, use JWT or session)
  const [authType, username] = authHeader.split(' ');
  if (authType !== 'Bearer' || !username) {
    return res.status(401).json({ message: "Unauthorized: Invalid token format" });
  }
  
  try {
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    
    // Attach user to request for use in route handlers
    (req as any).user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

// Admin role check middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database and create necessary tables
  await initDatabase();
  
  // Health check endpoint for Render
  app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "Server is running", timestamp: new Date().toISOString() });
  });
  
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.validateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Return user info and role
      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });
  
  // Check current user authentication status
  app.get("/api/auth/me", authenticateUser, (req, res) => {
    const user = (req as any).user;
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });

  // Get all profiles with pagination
  app.get("/api/profiles", async (req, res) => {
    try {
      const { query, page, limit } = paginatedSearchSchema.parse(req.query);
      
      // Get user preferences for cards per page limit
      const preferences = await storage.getGlobalPreferences();
      const userLimit = preferences.userPreferences?.cardsPerPage || limit;
      
      const result = await storage.getProfiles(query, page, userLimit);
      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        console.error("Error fetching profiles:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Get profile by ID
  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const profile = await storage.getProfile(id);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  // Create new profile (admin only)
  app.post("/api/profiles", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        console.error("Error creating profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Update profile (admin only)
  app.put("/api/profiles/:id", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.updateProfile(id, profileData);
      
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Delete profile (admin only)
  app.delete("/api/profiles/:id", authenticateUser, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteProfile(id);
      
      if (!success) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting profile:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  
  // Save global user preferences
  app.post("/api/preferences", async (req, res) => {
    try {
      const preferences = userPreferencesSchema.parse(req.body);
      await storage.saveGlobalPreferences({ userPreferences: preferences });
      res.status(200).json({ message: "Preferences saved successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        console.error("Error saving preferences:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });
  
  // Get global user preferences
  app.get("/api/preferences", async (req, res) => {
    try {
      const preferences = await storage.getGlobalPreferences();
      res.json({ 
        userPreferences: preferences.userPreferences || userPreferencesSchema.parse({}) 
      });
    } catch (error) {
      console.error("Error fetching preferences:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
