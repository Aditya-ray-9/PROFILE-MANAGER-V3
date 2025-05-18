import { useState, useEffect, useMemo } from 'react';
import { Profile } from '@shared/schema';

interface UsePaginationProps {
  itemsPerPage?: number;
}

export function usePagination(items: Profile[], { itemsPerPage = 6 }: UsePaginationProps = {}) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);
  
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(items.length / itemsPerPage));
  }, [items.length, itemsPerPage]);
  
  // Ensure currentPage is within bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  return {
    currentPage,
    totalPages,
    paginatedProfiles: paginatedItems,
    handlePageChange,
  };
}
