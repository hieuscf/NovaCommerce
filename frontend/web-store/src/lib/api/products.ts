import { apiClient } from './client';

import type { Category } from '@/types/product';

export const productsApi = {
  getCategories: async () => apiClient.get<Category[]>('/categories'),
};
