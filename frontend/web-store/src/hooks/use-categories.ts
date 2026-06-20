'use client';

import { useQuery } from '@tanstack/react-query';

import { productsApi } from '@/lib/api/products';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: productsApi.getCategories,
  });
}
