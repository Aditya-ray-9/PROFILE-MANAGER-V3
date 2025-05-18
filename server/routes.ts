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

// Initialize database tables (simplified for now)
async function initDatabase() {
  try {
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

  const httpServer = createServer(app);

  return httpServer;
}
