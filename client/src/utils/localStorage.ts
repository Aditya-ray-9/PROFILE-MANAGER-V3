import { Profile, InsertProfile } from "@shared/schema";
import { nanoid } from "nanoid";

// Keys for localStorage
const PROFILES_KEY = "profile-manager-profiles";

// Get all profiles from localStorage
export function getProfiles(): Profile[] {
  try {
    // For browser environments
    if (typeof window !== 'undefined' && window.localStorage) {
      const profilesJson = localStorage.getItem(PROFILES_KEY);
      if (!profilesJson) {
        return [];
      }
      return JSON.parse(profilesJson);
    } 
    // Fallback for server-side rendering or testing
    return [];
  } catch (error) {
    console.error("Error getting profiles from localStorage:", error);
    return [];
  }
}

// Get a single profile by ID
export function getProfile(id: number): Profile | undefined {
  const profiles = getProfiles();
  return profiles.find(profile => profile.id === id);
}

// Save a new profile to localStorage
export function createProfile(profileData: InsertProfile): Profile {
  const profiles = getProfiles();
  
  // Generate a new ID (max ID + 1, or 1 if no profiles exist)
  const maxId = profiles.length > 0 
    ? Math.max(...profiles.map(p => p.id)) 
    : 0;
  
  const newProfile: Profile = {
    ...profileData,
    id: maxId + 1,
    searchId: profileData.searchId || null,
    photoUrl: profileData.photoUrl || null,
    // Set default empty documents array if not provided
    documents: ('documents' in profileData) ? profileData.documents as any : []
  };
  
  // Add to the list and save
  profiles.push(newProfile);
  saveProfiles(profiles);
  
  return newProfile;
}

// Update an existing profile
export function updateProfile(id: number, profileData: InsertProfile): Profile | undefined {
  const profiles = getProfiles();
  const index = profiles.findIndex(profile => profile.id === id);
  
  if (index === -1) {
    return undefined;
  }
  
  const updatedProfile: Profile = {
    ...profileData,
    id,
    searchId: profileData.searchId || null,
    photoUrl: profileData.photoUrl || null,
    // Preserve existing documents if not provided in the update
    documents: 'documents' in profileData 
      ? profileData.documents 
      : (profiles[index].documents || [])
  };
  
  profiles[index] = updatedProfile;
  saveProfiles(profiles);
  
  return updatedProfile;
}

// Delete a profile by ID
export function deleteProfile(id: number): boolean {
  const profiles = getProfiles();
  const index = profiles.findIndex(profile => profile.id === id);
  
  if (index === -1) {
    return false;
  }
  
  profiles.splice(index, 1);
  saveProfiles(profiles);
  
  return true;
}

// Search profiles by query
export function searchProfiles(query?: string): Profile[] {
  const profiles = getProfiles();
  
  if (!query) {
    return profiles;
  }
  
  const lowercaseQuery = query.toLowerCase();
  return profiles.filter(profile => 
    profile.name.toLowerCase().includes(lowercaseQuery) || 
    (profile.searchId && profile.searchId.toLowerCase().includes(lowercaseQuery))
  );
}

// Helper function to save profiles to localStorage
function saveProfiles(profiles: Profile[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    }
  } catch (error) {
    console.error("Error saving profiles to localStorage:", error);
  }
}

// Default preferences
const DEFAULT_PREFERENCES = {
  theme: "system",
  language: "en",
  cardsPerPage: 6,
  notificationsEnabled: true,
  compactView: false,
  accentColor: "#0284c7"
};

// User preferences management
const USER_PREFERENCES_KEY = "profile-manager-preferences";

export function getUserPreferences() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const preferencesJson = localStorage.getItem(USER_PREFERENCES_KEY);
      if (!preferencesJson) {
        return DEFAULT_PREFERENCES;
      }
      return JSON.parse(preferencesJson);
    }
    return DEFAULT_PREFERENCES;
  } catch (error) {
    console.error("Error getting user preferences from localStorage:", error);
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(preferences: any) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error saving user preferences to localStorage:", error);
    return false;
  }
}