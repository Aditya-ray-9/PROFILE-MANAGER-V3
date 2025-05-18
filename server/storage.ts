import { profiles, type Profile, type InsertProfile } from "@shared/schema";
import { nanoid } from "nanoid";
import { db, sql, queryClient, isDatabaseConnected } from "./db";
import { eq, like, or, desc } from "drizzle-orm";

// Local storage for development/fallback
class MemStorage {
  private profiles: Map<number, Profile> = new Map();
  private currentId: number = 1;
  private preferences: Record<string, any> = {};

  constructor() {
    // Initialize with sample data in development
    if (process.env.NODE_ENV === 'development') {
      this.createProfile({
        profileId: nanoid(7),
        name: "Sample User",
        description: "This is a sample profile for testing.",
        searchId: "sample123",
        documents: [],
      });
    }
  }

  async getProfiles(query?: string, page: number = 1, limit: number = 6): Promise<{ profiles: Profile[], total: number }> {
    let filtered = Array.from(this.profiles.values());
    
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(profile => 
        profile.name.toLowerCase().includes(lowercaseQuery) || 
        (profile.searchId && profile.searchId.toLowerCase().includes(lowercaseQuery)) ||
        profile.profileId.toLowerCase().includes(lowercaseQuery) ||
        profile.id.toString().includes(lowercaseQuery)
      );
    }
    
    // Sort by id descending (newest first)
    filtered = filtered.sort((a, b) => b.id - a.id);
    
    // Paginate
    const total = filtered.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedProfiles = filtered.slice(start, end);
    
    return { profiles: paginatedProfiles, total };
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const id = this.currentId++;
    const newProfile: Profile = {
      ...profile,
      id,
      searchId: profile.searchId || null,
      photoUrl: profile.photoUrl || null,
      documents: Array.isArray(profile.documents) ? profile.documents : [],
    };
    
    this.profiles.set(id, newProfile);
    return newProfile;
  }

  async updateProfile(id: number, profile: InsertProfile): Promise<Profile | undefined> {
    if (!this.profiles.has(id)) {
      return undefined;
    }
    
    const updatedProfile: Profile = {
      ...profile,
      id,
      searchId: profile.searchId || null,
      photoUrl: profile.photoUrl || null,
      documents: Array.isArray(profile.documents) ? profile.documents : [],
    };
    
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteProfile(id: number): Promise<boolean> {
    return this.profiles.delete(id);
  }
  
  async saveGlobalPreferences(preferences: Record<string, any>): Promise<void> {
    this.preferences = {
      ...this.preferences,
      ...preferences
    };
  }
  
  async getGlobalPreferences(): Promise<Record<string, any>> {
    return this.preferences;
  }
}

// Create a memory-based fallback for when database is unavailable
const memStorage = new MemStorage();

export interface IStorage {
  getProfiles(query?: string, page?: number, limit?: number): Promise<{ profiles: Profile[], total: number }>;
  getProfile(id: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, profile: InsertProfile): Promise<Profile | undefined>;
  deleteProfile(id: number): Promise<boolean>;
  saveGlobalPreferences(preferences: Record<string, any>): Promise<void>;
  getGlobalPreferences(): Promise<Record<string, any>>;
}

// Hybrid storage that uses PostgreSQL when available, falls back to memory storage
export class HybridStorage implements IStorage {
  async getProfiles(query?: string, page: number = 1, limit: number = 6): Promise<{ profiles: Profile[], total: number }> {
    if (!isDatabaseConnected || !db || !queryClient) {
      console.log("Using memory storage for getProfiles");
      return memStorage.getProfiles(query, page, limit);
    }
    
    try {
      const offset = (page - 1) * limit;
      
      if (query) {
        const lowercaseQuery = `%${query.toLowerCase()}%`;
        
        // Get filtered profiles with pagination using direct SQL
        const result = await queryClient`
          SELECT p.*, count(*) OVER() as total_count
          FROM profiles p
          WHERE lower(p.name) LIKE ${lowercaseQuery}
             OR lower(p.profile_id) LIKE ${lowercaseQuery}
             OR (p.search_id IS NOT NULL AND lower(p.search_id) LIKE ${lowercaseQuery})
          ORDER BY p.id DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
        
        const total = result.length > 0 ? Number(result[0].total_count) : 0;
        const profiles = result.map(row => ({
          id: row.id,
          profileId: row.profile_id,
          name: row.name,
          searchId: row.search_id,
          description: row.description,
          photoUrl: row.photo_url,
          documents: row.documents || []
        }));
        
        return { profiles, total };
      }
      
      // If no search query, get all profiles with pagination
      const result = await queryClient`
        SELECT p.*, count(*) OVER() as total_count
        FROM profiles p
        ORDER BY p.id DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const total = result.length > 0 ? Number(result[0].total_count) : 0;
      const profiles = result.map(row => ({
        id: row.id,
        profileId: row.profile_id,
        name: row.name,
        searchId: row.search_id,
        description: row.description,
        photoUrl: row.photo_url,
        documents: row.documents || []
      }));
      
      return { profiles, total };
    } catch (error) {
      console.error("Database error in getProfiles:", error);
      // Fall back to memory storage on error
      return memStorage.getProfiles(query, page, limit);
    }
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    if (!isDatabaseConnected || !db || !queryClient) {
      console.log("Using memory storage for getProfile");
      return memStorage.getProfile(id);
    }
    
    try {
      const result = await queryClient`
        SELECT * FROM profiles WHERE id = ${id}
      `;
      
      if (result.length === 0) {
        return undefined;
      }
      
      const row = result[0];
      return {
        id: row.id,
        profileId: row.profile_id,
        name: row.name,
        searchId: row.search_id,
        description: row.description,
        photoUrl: row.photo_url,
        documents: row.documents || []
      };
    } catch (error) {
      console.error("Database error in getProfile:", error);
      return memStorage.getProfile(id);
    }
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    if (!isDatabaseConnected || !db || !queryClient) {
      console.log("Using memory storage for createProfile");
      return memStorage.createProfile(insertProfile);
    }
    
    try {
      // If profileId is not provided, generate one
      const profileData = {
        ...insertProfile,
        profileId: insertProfile.profileId || nanoid(7),
      };
      
      const result = await queryClient`
        INSERT INTO profiles ${queryClient(profileData, 
          'profileId:profile_id', 
          'name', 
          'searchId:search_id', 
          'description', 
          'photoUrl:photo_url', 
          'documents'
        )}
        RETURNING *
      `;
      
      const row = result[0];
      return {
        id: row.id,
        profileId: row.profile_id,
        name: row.name,
        searchId: row.search_id,
        description: row.description,
        photoUrl: row.photo_url,
        documents: row.documents || []
      };
    } catch (error) {
      console.error("Database error in createProfile:", error);
      return memStorage.createProfile(insertProfile);
    }
  }

  async updateProfile(id: number, updateProfile: InsertProfile): Promise<Profile | undefined> {
    if (!isDatabaseConnected || !db || !queryClient) {
      console.log("Using memory storage for updateProfile");
      return memStorage.updateProfile(id, updateProfile);
    }
    
    try {
      const result = await queryClient`
        UPDATE profiles 
        SET ${queryClient(updateProfile, 
          'profileId:profile_id', 
          'name', 
          'searchId:search_id', 
          'description', 
          'photoUrl:photo_url', 
          'documents'
        )}
        WHERE id = ${id}
        RETURNING *
      `;
      
      if (result.length === 0) {
        return undefined;
      }
      
      const row = result[0];
      return {
        id: row.id,
        profileId: row.profile_id,
        name: row.name,
        searchId: row.search_id,
        description: row.description,
        photoUrl: row.photo_url,
        documents: row.documents || []
      };
    } catch (error) {
      console.error("Database error in updateProfile:", error);
      return memStorage.updateProfile(id, updateProfile);
    }
  }

  async deleteProfile(id: number): Promise<boolean> {
    if (!isDatabaseConnected || !db || !queryClient) {
      console.log("Using memory storage for deleteProfile");
      return memStorage.deleteProfile(id);
    }
    
    try {
      const result = await queryClient`
        DELETE FROM profiles WHERE id = ${id} RETURNING id
      `;
      
      return result.length > 0;
    } catch (error) {
      console.error("Database error in deleteProfile:", error);
      return memStorage.deleteProfile(id);
    }
  }
  
  // Global preferences management
  async saveGlobalPreferences(preferences: Record<string, any>): Promise<void> {
    if (!isDatabaseConnected || !db || !queryClient) {
      console.log("Using memory storage for saveGlobalPreferences");
      return memStorage.saveGlobalPreferences(preferences);
    }
    
    try {
      // Create settings table if it doesn't exist
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
      console.error("Database error in saveGlobalPreferences:", error);
      return memStorage.saveGlobalPreferences(preferences);
    }
  }
  
  async getGlobalPreferences(): Promise<Record<string, any>> {
    if (!isDatabaseConnected || !db || !queryClient) {
      console.log("Using memory storage for getGlobalPreferences");
      return memStorage.getGlobalPreferences();
    }
    
    try {
      // Check if settings table exists
      const tableExists = await queryClient`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'settings'
        )
      `;
      
      if (!tableExists[0].exists) {
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
      console.error("Database error in getGlobalPreferences:", error);
      return memStorage.getGlobalPreferences();
    }
  }
}

export const storage = new HybridStorage();
