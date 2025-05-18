import { useState, useEffect, useMemo } from 'react';
import { Profile } from '@shared/schema';

interface UsePaginationProps {
  itemsPerPage?: number;
}

export function usePagination(items: Profile[] = [], { itemsPerPage = 6 }: UsePaginationProps = {}) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Ensure items is always an array
  const safeItems = Array.isArray(items) ? items : [];
  
  // Reset to page 1 when items change
  useEffect(() => {
    setCurrentPage(1);
  }, [safeItems.length]);
  
  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(safeItems.length / itemsPerPage));
  }, [safeItems.length, itemsPerPage]);
  
  // Ensure currentPage is within bounds
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);
  
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return safeItems.slice(start, end);
  }, [safeItems, currentPage, itemsPerPage]);
  
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
