import { useMutation, useQueryClient } from '@tanstack/react-query';
import { businessesApi } from '@/services/api';
import type { Business } from '@/types';

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Business, 'id'>) => businessesApi.create(data),
    onSuccess: () => {
      // Invalidate businesses list so marketplace refreshes
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
}
