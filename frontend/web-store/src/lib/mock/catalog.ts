import type {
  Category,
  Product,
  ProductReview,
  ProductVariant,
} from '@/types/product';

type ProductFilters = {
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  minRating?: number;
};

export const categories: Category[] = [
  { id: 'cat-fashion', name: 'Thoi trang', slug: 'thoi-trang' },
  { id: 'cat-beauty', name: 'Lam dep', slug: 'lam-dep' },
  { id: 'cat-home', name: 'Nha cua', slug: 'nha-cua' },
  { id: 'cat-tech', name: 'Cong nghe', slug: 'cong-nghe' },
];

const makeVariants = (items: Array<Partial<ProductVariant> & { id: string }>) =>
  items.map((item) => ({
    size: 'M',
    color: 'Black',
    price: 0,
    stock: 0,
    sku: item.id.toUpperCase(),
    ...item,
  })) as ProductVariant[];

export const products: Product[] = [
  {
    id: 'p-ao-khoac-air',
    slug: 'ao-khoac-airflex',
    name: 'Ao khoac AirFlex',
    categorySlug: 'thoi-trang',
    brand: 'Nova Wear',
    description:
      'Ao khoac chong nang vai nhe, thoang khi, phu hop di chuyen hang ngay.',
    basePrice: 890000,
    rating: 4.7,
    ratingCount: 126,
    badges: ['hot'],
    tags: ['ao khoac', 'airflex', 'chong nang'],
    isTrending: true,
    isRecommended: true,
    images: [
      'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: makeVariants([
      {
        id: 'airflex-m-black',
        size: 'M',
        color: 'Black',
        price: 890000,
        stock: 21,
      },
      {
        id: 'airflex-l-black',
        size: 'L',
        color: 'Black',
        price: 920000,
        stock: 8,
      },
      {
        id: 'airflex-m-beige',
        size: 'M',
        color: 'Beige',
        price: 910000,
        stock: 0,
      },
    ]),
  },
  {
    id: 'p-son-tint-glow',
    slug: 'son-tint-glow',
    name: 'Son Tint Glow',
    categorySlug: 'lam-dep',
    brand: 'Lumi Lab',
    description: 'Son tint bong nhe mau, giu am moi den 8 gio.',
    basePrice: 259000,
    rating: 4.6,
    ratingCount: 343,
    badges: ['sale'],
    tags: ['son', 'lam dep', 'tint'],
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: makeVariants([
      {
        id: 'tint-rose',
        size: 'Rose',
        color: 'Rose',
        price: 259000,
        stock: 56,
      },
      {
        id: 'tint-coral',
        size: 'Coral',
        color: 'Coral',
        price: 269000,
        stock: 42,
      },
    ]),
  },
  {
    id: 'p-noi-inox-plus',
    slug: 'bo-noi-inox-plus',
    name: 'Bo noi Inox Plus',
    categorySlug: 'nha-cua',
    brand: 'HomeWare',
    description: 'Bo noi 3 mon inox 304 day dan, dung duoc voi bep tu.',
    basePrice: 1190000,
    rating: 4.5,
    ratingCount: 88,
    badges: ['new'],
    tags: ['noi', 'nha bep', 'inox'],
    isRecommended: true,
    images: [
      'https://images.unsplash.com/photo-1584990347449-a17f00dc45d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: makeVariants([
      {
        id: 'inox-3pcs-silver',
        size: '3pcs',
        color: 'Silver',
        price: 1190000,
        stock: 17,
      },
      {
        id: 'inox-5pcs-silver',
        size: '5pcs',
        color: 'Silver',
        price: 1590000,
        stock: 6,
      },
    ]),
  },
  {
    id: 'p-tai-nghe-wave',
    slug: 'tai-nghe-wavebuds-pro',
    name: 'Tai nghe WaveBuds Pro',
    categorySlug: 'cong-nghe',
    brand: 'Nova Audio',
    description: 'Tai nghe chong on chu dong, pin 30 gio, ket noi da thiet bi.',
    basePrice: 1690000,
    rating: 4.8,
    ratingCount: 245,
    badges: ['hot'],
    tags: ['tai nghe', 'bluetooth', 'anc'],
    isTrending: true,
    isRecommended: true,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: makeVariants([
      {
        id: 'wavebuds-black',
        size: 'Standard',
        color: 'Black',
        price: 1690000,
        stock: 35,
      },
      {
        id: 'wavebuds-white',
        size: 'Standard',
        color: 'White',
        price: 1690000,
        stock: 12,
      },
    ]),
  },
  {
    id: 'p-giay-runner',
    slug: 'giay-runner-x',
    name: 'Giay Runner X',
    categorySlug: 'thoi-trang',
    brand: 'Nova Wear',
    description: 'Giay the thao de em, dem hoi, phu hop chay bo va di bo.',
    basePrice: 1290000,
    rating: 4.4,
    ratingCount: 74,
    badges: ['sale'],
    tags: ['giay', 'the thao', 'runner'],
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: makeVariants([
      {
        id: 'runner-40-red',
        size: '40',
        color: 'Red',
        price: 1290000,
        stock: 14,
      },
      {
        id: 'runner-41-blue',
        size: '41',
        color: 'Blue',
        price: 1320000,
        stock: 9,
      },
    ]),
  },
  {
    id: 'p-serum-c',
    slug: 'serum-vitamin-c-12',
    name: 'Serum Vitamin C 12%',
    categorySlug: 'lam-dep',
    brand: 'Derma Nova',
    description: 'Serum sang da, ho tro deu mau, ket cau nhe, tham nhanh.',
    basePrice: 389000,
    rating: 4.3,
    ratingCount: 149,
    badges: ['new'],
    tags: ['serum', 'vitamin c', 'duong da'],
    images: [
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: makeVariants([
      {
        id: 'serum-30ml',
        size: '30ml',
        color: 'Amber',
        price: 389000,
        stock: 25,
      },
      {
        id: 'serum-50ml',
        size: '50ml',
        color: 'Amber',
        price: 549000,
        stock: 11,
      },
    ]),
  },
  {
    id: 'p-may-xay-mini',
    slug: 'may-xay-mini-fitblend',
    name: 'May xay mini FitBlend',
    categorySlug: 'nha-cua',
    brand: 'KitchenUp',
    description: 'May xay mini cong suat cao, kem 2 coc mang di.',
    basePrice: 690000,
    rating: 4.2,
    ratingCount: 62,
    badges: [],
    tags: ['may xay', 'sinh to', 'nha bep'],
    images: [
      'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590080876645-2f7f8c0f4b4d?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: makeVariants([
      {
        id: 'fitblend-green',
        size: '500ml',
        color: 'Green',
        price: 690000,
        stock: 29,
      },
      {
        id: 'fitblend-cream',
        size: '500ml',
        color: 'Cream',
        price: 690000,
        stock: 18,
      },
    ]),
  },
  {
    id: 'p-smartwatch-s',
    slug: 'smartwatch-s-active',
    name: 'Smartwatch S Active',
    categorySlug: 'cong-nghe',
    brand: 'Nova Tech',
    description: 'Dong ho thong minh theo doi suc khoe, khang nuoc IP68.',
    basePrice: 2490000,
    rating: 4.7,
    ratingCount: 191,
    badges: ['hot', 'sale'],
    tags: ['dong ho', 'smartwatch', 'the thao'],
    isTrending: true,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1200&q=80',
    ],
    variants: makeVariants([
      {
        id: 'sactive-black',
        size: '42mm',
        color: 'Black',
        price: 2490000,
        stock: 13,
      },
      {
        id: 'sactive-pink',
        size: '42mm',
        color: 'Pink',
        price: 2490000,
        stock: 7,
      },
    ]),
  },
];

export const productReviews: Record<string, ProductReview[]> = {
  'ao-khoac-airflex': [
    {
      id: 'r-airflex-1',
      author: 'Ngoc Anh',
      rating: 5,
      title: 'Chat vai rat ok',
      comment: 'Mac nhe, thoang va dep. Giao hang nhanh.',
      createdAt: '2026-05-16',
    },
    {
      id: 'r-airflex-2',
      author: 'Quoc Minh',
      rating: 4,
      title: 'Dang tien',
      comment: 'Form vua van, nen co them mau xanh navy.',
      createdAt: '2026-05-22',
    },
  ],
  'tai-nghe-wavebuds-pro': [
    {
      id: 'r-wave-1',
      author: 'Thanh Huyen',
      rating: 5,
      title: 'ANC tot',
      comment: 'Nghe ro va chong on hieu qua khi di xe bus.',
      createdAt: '2026-06-01',
    },
  ],
};

export function formatVnd(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

export function getProductBySlug(slug: string) {
  return products.find((item) => item.slug === slug) ?? null;
}

export function getCategoryBySlug(slug: string) {
  return categories.find((item) => item.slug === slug) ?? null;
}

export function getProductPriceRange(product: Product) {
  const prices = product.variants.map((variant) => variant.price);
  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}

export function getSimilarProducts(product: Product, limit = 4) {
  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        (candidate.categorySlug === product.categorySlug ||
          candidate.brand === product.brand),
    )
    .slice(0, limit);
}

export function getFeaturedCategories() {
  return categories.slice(0, 4);
}

export function getTrendingProducts(limit = 8) {
  return products.filter((item) => item.isTrending).slice(0, limit);
}

export function getRecommendedProducts(limit = 8) {
  return products.filter((item) => item.isRecommended).slice(0, limit);
}

export function getAvailableBrands(categorySlug?: string) {
  const source = categorySlug
    ? products.filter((product) => product.categorySlug === categorySlug)
    : products;
  return Array.from(new Set(source.map((product) => product.brand))).sort();
}

export function searchSuggestions(query: string, limit = 6) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return products
    .filter((product) =>
      [product.name, product.brand, ...product.tags].some((field) =>
        field.toLowerCase().includes(normalized),
      ),
    )
    .slice(0, limit)
    .map((product) => ({ slug: product.slug, label: product.name }));
}

export function getProductsByCategory(slug: string, filters?: ProductFilters) {
  return applyFilters(
    products.filter((product) => product.categorySlug === slug),
    filters,
  );
}

export function searchProducts(query: string, filters?: ProductFilters) {
  const normalized = query.trim().toLowerCase();
  const searched = products.filter((product) =>
    [product.name, product.brand, product.description, ...product.tags].some(
      (field) => field.toLowerCase().includes(normalized),
    ),
  );

  return applyFilters(searched, filters);
}

export function sortProducts(source: Product[], sortBy: string) {
  const items = [...source];
  switch (sortBy) {
    case 'price_asc':
      return items.sort(
        (a, b) =>
          getProductPriceRange(a).minPrice - getProductPriceRange(b).minPrice,
      );
    case 'price_desc':
      return items.sort(
        (a, b) =>
          getProductPriceRange(b).minPrice - getProductPriceRange(a).minPrice,
      );
    case 'rating':
      return items.sort((a, b) => b.rating - a.rating);
    default:
      return items.sort((a, b) => b.ratingCount - a.ratingCount);
  }
}

function applyFilters(source: Product[], filters?: ProductFilters) {
  if (!filters) {
    return source;
  }

  return source.filter((product) => {
    const { minPrice, maxPrice } = getProductPriceRange(product);
    const withinMin =
      typeof filters.minPrice !== 'number' || maxPrice >= filters.minPrice;
    const withinMax =
      typeof filters.maxPrice !== 'number' || minPrice <= filters.maxPrice;
    const brandMatch =
      !filters.brands ||
      filters.brands.length === 0 ||
      filters.brands.includes(product.brand);
    const ratingMatch =
      typeof filters.minRating !== 'number' ||
      product.rating >= filters.minRating;

    return withinMin && withinMax && brandMatch && ratingMatch;
  });
}
