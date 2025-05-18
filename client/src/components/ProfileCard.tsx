import { Profile } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { getInitials } from "@/lib/utils";
// Import the default profile image directly
import defaultProfileImage from "../assets/default-profile.jpg";

interface ProfileCardProps {
  profile: Profile;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ProfileCard({ profile, onEdit, onDelete }: ProfileCardProps) {
  const { name, profileId, searchId, description, photoUrl } = profile;
  const initials = getInitials(name);
  // Use the default image if no photo URL is provided
  const avatarUrl = photoUrl || defaultProfileImage;

  return (
    <Card className="overflow-hidden transition-all duration-200 hover:translate-y-[-2px] hover:shadow-lg">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
              {searchId && <p className="text-sm text-gray-500">#{searchId}</p>}
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="icon" onClick={onEdit} title="Edit profile" className="h-8 w-8 text-gray-400 hover:text-primary">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} title="Delete profile" className="h-8 w-8 text-gray-400 hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600 line-clamp-2">{description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">ID: {profileId}</span>
          <Button variant="link" className="p-0 h-auto text-primary hover:text-blue-700 text-sm font-medium">
            View Details
            <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
