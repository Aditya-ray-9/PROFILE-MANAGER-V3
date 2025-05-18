import { useState, useEffect, useMemo } from 'react';
import { Profile } from '@shared/schema';

export function useSearch(profiles: Profile[]) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) {
      return profiles;
    }
    
    const query = searchQuery.toLowerCase();
    return profiles.filter(profile => {
      return (
        profile.name.toLowerCase().includes(query) || 
        (profile.searchId && profile.searchId.toLowerCase().includes(query))
      );
    });
  }, [profiles, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredProfiles,
  };
}
