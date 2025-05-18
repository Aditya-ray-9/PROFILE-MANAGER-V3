import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ChevronLeft, FileIcon, ExternalLink } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { Profile, Document } from '@shared/schema';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import ProfileModal from '@/components/ProfileModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import defaultProfileImage from "../assets/default-profile.jpg";

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toast } = useToast();

  // Fetch profile data
  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['/api/profiles', id],
    enabled: !!id,
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleEdit = () => {
    setProfileModalOpen(true);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
  };

  const handleSubmitProfile = async (data: any) => {
    try {
      await apiRequest('/api/profiles/' + id, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      // Invalidate the profile query to reload data
      queryClient.invalidateQueries({ queryKey: ['/api/profiles', id] });
      
      setProfileModalOpen(false);
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await apiRequest('/api/profiles/' + id, {
        method: 'DELETE',
      });
      
      // Redirect back to profiles page after deletion
      navigate('/profiles');
      
      toast({
        title: 'Success',
        description: 'Profile deleted successfully',
      });
      
      // Invalidate the profiles list query
      queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete profile',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="profiles" isOpen={sidebarOpen} />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-background">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="outline" 
              className="mb-6" 
              onClick={() => navigate('/profiles')}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Profiles
            </Button>
            
            {isLoading ? (
              <ProfileSkeleton />
            ) : isError ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Profile not found</h3>
                <p className="text-gray-500">The profile you're looking for doesn't exist or has been deleted.</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => navigate('/profiles')}
                >
                  Go back to Profiles
                </Button>
              </div>
            ) : profile ? (
              <div className="space-y-8">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-40 bg-gradient-to-r from-blue-500 to-cyan-500">
                    <div className="absolute -bottom-12 left-6 flex items-end">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                        <AvatarImage src={profile.photoUrl || defaultProfileImage} alt={profile.name} />
                        <AvatarFallback className="text-lg">{getInitials(profile.name)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleEdit}
                        className="bg-white/90 text-gray-800 hover:bg-white"
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={handleDelete}
                        className="bg-white/90 text-red-500 hover:bg-white"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-16 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                        <div className="flex items-center mt-1 space-x-4">
                          {profile.searchId && (
                            <span className="text-sm text-gray-500">#{profile.searchId}</span>
                          )}
                          <span className="text-sm text-gray-500">ID: {profile.profileId}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h2 className="text-lg font-semibold mb-2">About</h2>
                      <p className="text-gray-700 whitespace-pre-line">{profile.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Documents section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
                  <h2 className="text-lg font-semibold mb-4">Documents</h2>
                  
                  {profile.documents && profile.documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.documents.map((doc: Document) => (
                        <Card key={doc.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 bg-blue-100 p-2 rounded">
                                <FileIcon className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h4>
                                <p className="text-xs text-gray-500">{doc.type}</p>
                                <p className="text-xs text-gray-500 mt-1">Added: {new Date(doc.dateAdded).toLocaleDateString()}</p>
                              </div>
                              <a 
                                href={doc.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <FileIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-sm font-medium text-gray-900">No documents</h3>
                      <p className="text-xs text-gray-500 mt-1">This profile doesn't have any documents yet</p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
      
      {profile && (
        <>
          <ProfileModal 
            isOpen={profileModalOpen} 
            profile={profile} 
            handleClose={handleCloseProfileModal} 
            handleSubmit={handleSubmitProfile} 
          />
          
          <DeleteConfirmationModal 
            isOpen={deleteModalOpen} 
            handleClose={handleCloseDeleteModal} 
            confirmDelete={handleConfirmDelete} 
          />
        </>
      )}
    </div>
  );
}

// Loading skeleton for profile details
function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="relative h-40 bg-gray-200">
          <div className="absolute -bottom-12 left-6">
            <Skeleton className="h-24 w-24 rounded-full" />
          </div>
        </div>
        
        <div className="pt-16 p-6">
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
            
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}