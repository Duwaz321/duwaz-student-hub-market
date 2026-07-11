import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
  });
}
