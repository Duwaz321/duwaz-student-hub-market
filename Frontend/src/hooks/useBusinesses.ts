import { useQuery } from '@tanstack/react-query';
import { businessesApi } from '@/services/api';

export function useBusinesses() {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: businessesApi.getAll,
  });
}

export function useBusiness(id: number) {
  return useQuery({
    queryKey: ['businesses', id],
    queryFn: () => businessesApi.getById(id),
    enabled: !!id,
  });
}
