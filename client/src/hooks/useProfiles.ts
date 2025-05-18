import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Profile, InsertProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useProfiles() {
  const { toast } = useToast();
  
  const { data: profiles = [], isLoading, isError } = useQuery<Profile[]>({
    queryKey: ['/api/profiles'],
  });

  const createMutation = useMutation({
    mutationFn: async (profileData: InsertProfile) => {
      const res = await apiRequest('POST', '/api/profiles', profileData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      toast({
        title: "Profile created",
        description: "The profile has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create profile: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: InsertProfile }) => {
      const res = await apiRequest('PUT', `/api/profiles/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      toast({
        title: "Profile updated",
        description: "The profile has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update profile: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/profiles/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
      toast({
        title: "Profile deleted",
        description: "The profile has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete profile: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const createProfile = async (profileData: InsertProfile) => {
    await createMutation.mutateAsync(profileData);
  };

  const updateProfile = async (id: number, profileData: InsertProfile) => {
    await updateMutation.mutateAsync({ id, data: profileData });
  };

  const deleteProfile = async (id: number) => {
    await deleteMutation.mutateAsync(id);
  };

  return {
    profiles,
    isLoading,
    isError,
    createProfile,
    updateProfile,
    deleteProfile,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
