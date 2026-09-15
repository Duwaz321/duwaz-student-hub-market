import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api';
import type { Product } from '@/types';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: productsApi.getAll,
    staleTime: 2 * 60 * 1000,  // 2 minutes — matches backend cache TTL
    gcTime:    5 * 60 * 1000,  // keep in memory 5 minutes after last use
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    gcTime:    5 * 60 * 1000,
  });
}

export function useBusinessProducts(businessId: number) {
  return useQuery({
    queryKey: ['products', 'business', businessId],
    queryFn: () => productsApi.getByBusiness(businessId),
    enabled: !!businessId,
    staleTime: 60 * 1000,  // 1 minute — shop owner may update stock frequently
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Product, 'id'>) => productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Product> }) =>
      productsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, delta }: { id: number; delta: number }) =>
      productsApi.adjustStock(id, delta),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['shop', 'stats'] });
    },
  });
}
