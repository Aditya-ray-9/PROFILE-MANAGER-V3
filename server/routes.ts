import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { sql } from "./db";
import { insertProfileSchema, profileSearchSchema, userPreferencesSchema } from "@shared/schema";
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
    
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize database and create necessary tables
  await initDatabase();

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

  // Create new profile
  app.post("/api/profiles", async (req, res) => {
    try {
      const profileData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(profileData);
      res.status(201).json(profile);
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ message: fromZodError(error).message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Update profile
  app.put("/api/profiles/:id", async (req, res) => {
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
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // Delete profile
  app.delete("/api/profiles/:id", async (req, res) => {
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
