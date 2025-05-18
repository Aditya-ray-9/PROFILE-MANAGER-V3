import { profiles, type Profile, type InsertProfile } from "@shared/schema";
import { nanoid } from "nanoid";
import { db, sql, queryClient } from "./db";
import { eq, like, or, desc } from "drizzle-orm";

export interface IStorage {
  getProfiles(query?: string, page?: number, limit?: number): Promise<{ profiles: Profile[], total: number }>;
  getProfile(id: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, profile: InsertProfile): Promise<Profile | undefined>;
  deleteProfile(id: number): Promise<boolean>;
  saveGlobalPreferences(preferences: Record<string, any>): Promise<void>;
  getGlobalPreferences(): Promise<Record<string, any>>;
}

export class DatabaseStorage implements IStorage {
  async getProfiles(query?: string, page: number = 1, limit: number = 6): Promise<{ profiles: Profile[], total: number }> {
    try {
      // Calculate offset based on page and limit
      const offset = (page - 1) * limit;
      
      // If there's a search query, filter profiles
      if (query) {
        const lowercaseQuery = `%${query.toLowerCase()}%`;
        
        // Get filtered profiles with pagination
        const filteredProfiles = await db
          .select()
          .from(profiles)
          .where(
            or(
              like(sql`lower(${profiles.name})`, lowercaseQuery),
              like(sql`lower(${profiles.profileId})`, lowercaseQuery),
              like(sql`lower(coalesce(${profiles.searchId}, ''))`, lowercaseQuery)
            )
          )
          .orderBy(desc(profiles.id))
          .limit(limit)
          .offset(offset);
          
        // Get total count for pagination
        const [{ count }] = await db
          .select({ count: sql<number>`count(*)` })
          .from(profiles)
          .where(
            or(
              like(sql`lower(${profiles.name})`, lowercaseQuery),
              like(sql`lower(${profiles.profileId})`, lowercaseQuery),
              like(sql`lower(coalesce(${profiles.searchId}, ''))`, lowercaseQuery)
            )
          );
            
        return { 
          profiles: filteredProfiles,
          total: Number(count) 
        };
      }
      
      // If no search query, get all profiles with pagination
      const allProfiles = await db
        .select()
        .from(profiles)
        .orderBy(desc(profiles.id))
        .limit(limit)
        .offset(offset);
        
      // Get total count for pagination
      const [{ count }] = await db
        .select({ count: sql<number>`count(*)` })
        .from(profiles);
        
      return { 
        profiles: allProfiles,
        total: Number(count) 
      };
    } catch (error) {
      console.error("Error getting profiles from database:", error);
      return { profiles: [], total: 0 };
    }
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    try {
      const [profile] = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, id));
        
      return profile;
    } catch (error) {
      console.error("Error getting profile from database:", error);
      return undefined;
    }
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    try {
      // If profileId is not provided, generate one
      const profileData = {
        ...insertProfile,
        profileId: insertProfile.profileId || nanoid(7),
      };
      
      const [profile] = await db
        .insert(profiles)
        .values(profileData)
        .returning();
        
      return profile;
    } catch (error) {
      console.error("Error creating profile in database:", error);
      throw error;
    }
  }

  async updateProfile(id: number, updateProfile: InsertProfile): Promise<Profile | undefined> {
    try {
      const [profile] = await db
        .update(profiles)
        .set(updateProfile)
        .where(eq(profiles.id, id))
        .returning();
        
      return profile;
    } catch (error) {
      console.error("Error updating profile in database:", error);
      return undefined;
    }
  }

  async deleteProfile(id: number): Promise<boolean> {
    try {
      const [deleted] = await db
        .delete(profiles)
        .where(eq(profiles.id, id))
        .returning();
        
      return !!deleted;
    } catch (error) {
      console.error("Error deleting profile from database:", error);
      return false;
    }
  }
  
  // Global preferences management
  async saveGlobalPreferences(preferences: Record<string, any>): Promise<void> {
    try {
      // Create settings table if it doesn't exist using raw query client
      await queryClient`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value JSONB NOT NULL
        )
      `;
      
      // Save each preference as a separate row
      for (const [key, value] of Object.entries(preferences)) {
        await queryClient`
          INSERT INTO settings (key, value)
          VALUES (${key}, ${JSON.stringify(value)})
          ON CONFLICT (key) DO UPDATE SET value = ${JSON.stringify(value)}
        `;
      }
    } catch (error) {
      console.error("Error saving global preferences:", error);
      throw error;
    }
  }
  
  async getGlobalPreferences(): Promise<Record<string, any>> {
    try {
      // Check if table exists using raw query client
      const tableExists = await queryClient`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'settings'
        )
      `;
      
      const exists = tableExists[0]?.exists;
      
      if (!exists) {
        return {};
      }
      
      // Get all preferences
      const settings = await queryClient`
        SELECT key, value FROM settings
      `;
      
      const preferences: Record<string, any> = {};
      for (const row of settings) {
        preferences[row.key] = row.value;
      }
      
      return preferences;
    } catch (error) {
      console.error("Error getting global preferences:", error);
      return {};
    }
  }
}

export const storage = new DatabaseStorage();
