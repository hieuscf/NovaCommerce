import type { ApiEnvelope } from '@/types/api';
import type { Category } from '@/types/product';

export const productsApi = {
  getCategories: async () => {
    const response = await fetch('/api/categories', {
      credentials: 'include',
    });

    const payload = (await response.json()) as ApiEnvelope<Category[]>;
    if (!response.ok || payload.error) {
      throw new Error(payload.error?.message ?? 'Unable to fetch categories.');
    }

    return payload.data;
  },
};
