import { Profile } from "@shared/schema";
import ProfileCard from "./ProfileCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileGridProps {
  profiles: Profile[];
  isLoading: boolean;
  handleEdit?: (profile: Profile) => void;
  handleDelete?: (id: number) => void;
}

export default function ProfileGrid({ profiles, isLoading, handleEdit, handleDelete }: ProfileGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Plus className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No profiles yet</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new profile</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {profiles.map((profile) => (
          <ProfileCard 
            key={profile.id} 
            profile={profile} 
            onEdit={() => handleEdit(profile)} 
            onDelete={() => handleDelete(profile.id)} 
          />
        ))}
      </div>
    </div>
  );
}
