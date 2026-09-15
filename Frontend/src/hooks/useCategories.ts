import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/services/api';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes — categories almost never change
    gcTime:    30 * 60 * 1000,
  });
}
