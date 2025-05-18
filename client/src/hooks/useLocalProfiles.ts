import { useState, useEffect, useCallback } from 'react';
import { Profile, InsertProfile } from '@shared/schema';
import { 
  getProfiles, 
  getProfile, 
  createProfile, 
  updateProfile, 
  deleteProfile, 
  searchProfiles 
} from '../utils/localStorage';
import { useToast } from './use-toast';

export function useLocalProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { toast } = useToast();

  // Load profiles from localStorage
  const loadProfiles = useCallback(() => {
    try {
      const loadedProfiles = getProfiles();
      setProfiles(loadedProfiles);
      setIsError(false);
    } catch (error) {
      console.error("Error loading profiles:", error);
      setIsError(true);
      toast({
        title: "Error",
        description: "Failed to load profiles.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial load
  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // Create profile
  const handleCreateProfile = async (profileData: InsertProfile) => {
    try {
      const newProfile = createProfile(profileData);
      setProfiles((prevProfiles) => [...prevProfiles, newProfile]);
      toast({
        title: "Profile created",
        description: "The profile has been created successfully.",
      });
      return newProfile;
    } catch (error) {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description: "Failed to create profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Update profile
  const handleUpdateProfile = async (id: number, profileData: InsertProfile) => {
    try {
      const updatedProfile = updateProfile(id, profileData);
      
      if (!updatedProfile) {
        toast({
          title: "Error",
          description: "Profile not found.",
          variant: "destructive",
        });
        return;
      }
      
      setProfiles((prevProfiles) => 
        prevProfiles.map((profile) => 
          profile.id === id ? updatedProfile : profile
        )
      );
      
      toast({
        title: "Profile updated",
        description: "The profile has been updated successfully.",
      });
      
      return updatedProfile;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Delete profile
  const handleDeleteProfile = async (id: number) => {
    try {
      const success = deleteProfile(id);
      
      if (!success) {
        toast({
          title: "Error",
          description: "Profile not found.",
          variant: "destructive",
        });
        return;
      }
      
      setProfiles((prevProfiles) => 
        prevProfiles.filter((profile) => profile.id !== id)
      );
      
      toast({
        title: "Profile deleted",
        description: "The profile has been deleted successfully.",
      });
      
      return success;
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Error",
        description: "Failed to delete profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Search profiles
  const handleSearchProfiles = (query?: string) => {
    try {
      return searchProfiles(query);
    } catch (error) {
      console.error("Error searching profiles:", error);
      toast({
        title: "Error",
        description: "Failed to search profiles.",
        variant: "destructive",
      });
      return [];
    }
  };

  return {
    profiles,
    isLoading,
    isError,
    createProfile: handleCreateProfile,
    updateProfile: handleUpdateProfile,
    deleteProfile: handleDeleteProfile,
    searchProfiles: handleSearchProfiles,
    refreshProfiles: loadProfiles,
  };
}