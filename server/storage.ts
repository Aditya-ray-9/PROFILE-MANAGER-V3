import { profiles, type Profile, type InsertProfile } from "@shared/schema";

export interface IStorage {
  getProfiles(query?: string): Promise<Profile[]>;
  getProfile(id: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: number, profile: InsertProfile): Promise<Profile | undefined>;
  deleteProfile(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private profiles: Map<number, Profile>;
  currentId: number;

  constructor() {
    this.profiles = new Map();
    this.currentId = 1;
  }

  async getProfiles(query?: string): Promise<Profile[]> {
    const allProfiles = Array.from(this.profiles.values());
    
    if (!query) {
      return allProfiles;
    }
    
    const lowercaseQuery = query.toLowerCase();
    return allProfiles.filter(profile => 
      profile.name.toLowerCase().includes(lowercaseQuery) || 
      (profile.searchId && profile.searchId.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.currentId++;
    const profile: Profile = { 
      ...insertProfile, 
      id,
      searchId: insertProfile.searchId || null,
      photoUrl: insertProfile.photoUrl || null
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(id: number, updateProfile: InsertProfile): Promise<Profile | undefined> {
    const existingProfile = this.profiles.get(id);
    
    if (!existingProfile) {
      return undefined;
    }
    
    const updatedProfile: Profile = { 
      ...updateProfile, 
      id,
      searchId: updateProfile.searchId || null,
      photoUrl: updateProfile.photoUrl || null
    };
    this.profiles.set(id, updatedProfile);
    return updatedProfile;
  }

  async deleteProfile(id: number): Promise<boolean> {
    return this.profiles.delete(id);
  }
}

export const storage = new MemStorage();
