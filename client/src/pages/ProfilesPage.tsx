import { useState } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MobileNavigation from '@/components/MobileNavigation';
import SearchAndActions from '@/components/SearchAndActions';
import ProfileGrid from '@/components/ProfileGrid';
import Pagination from '@/components/Pagination';
import ProfileModal from '@/components/ProfileModal';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
// Using API data hooks to fetch from database
import { useProfiles } from '@/hooks/useProfiles';
import { useSearch } from '@/hooks/useSearch';
import { usePagination } from '@/hooks/usePagination';
import { InsertProfile, Profile } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [profileToDelete, setProfileToDelete] = useState<number | null>(null);
  
  // Get authentication context to check if user is admin
  const { isAdmin } = useAuth();

  const { 
    profiles, 
    isLoading, 
    createProfile, 
    updateProfile, 
    deleteProfile 
  } = useProfiles();
  
  const { searchQuery, setSearchQuery, filteredProfiles } = useSearch(profiles);
  const { currentPage, totalPages, paginatedProfiles, handlePageChange } = usePagination(filteredProfiles);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setEditingProfile(null);
    setProfileModalOpen(true);
  };

  const handleEdit = (profile: Profile) => {
    if (!isAdmin) return;
    setEditingProfile(profile);
    setProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
    setEditingProfile(null);
  };

  const handleOpenDeleteModal = (id: number) => {
    if (!isAdmin) return;
    setProfileToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setProfileToDelete(null);
  };

  const handleSubmitProfile = async (profileData: InsertProfile) => {
    if (!isAdmin) return;
    
    if (editingProfile) {
      await updateProfile(editingProfile.id, profileData);
    } else {
      await createProfile(profileData);
    }
    setProfileModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!isAdmin) return;
    
    if (profileToDelete !== null) {
      await deleteProfile(profileToDelete);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header toggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar active="profiles" isOpen={sidebarOpen} />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <SearchAndActions 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              openAddProfileModal={handleOpenAddModal} 
            />
            
            <ProfileGrid 
              profiles={paginatedProfiles} 
              isLoading={isLoading} 
              handleEdit={handleEdit} 
              handleDelete={handleOpenDeleteModal} 
            />
            
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              handlePageChange={handlePageChange} 
              totalItems={filteredProfiles.length}
              itemsPerPage={6}
            />
          </div>
        </main>
      </div>
      
      <MobileNavigation activePage="profiles" />
      
      <ProfileModal 
        isOpen={profileModalOpen} 
        profile={editingProfile} 
        handleClose={handleCloseProfileModal} 
        handleSubmit={handleSubmitProfile} 
      />
      
      <DeleteConfirmationModal 
        isOpen={deleteModalOpen} 
        handleClose={handleCloseDeleteModal} 
        confirmDelete={handleConfirmDelete} 
      />
    </div>
  );
}
