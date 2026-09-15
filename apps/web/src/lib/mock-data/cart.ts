/**
 * Presentation fixture for the Alloy cart page until Gateway
 * `GET /api/v1/users/me/cart` is wired. Line names/images come from the catalog.
 */
export interface CartFixtureLine {
  readonly id: string;
  readonly productId: string;
  readonly quantity: number;
  readonly variantLabel: string;
  readonly selected?: boolean;
}

export const cartFixtureLines: readonly CartFixtureLine[] = [
  {
    id: 'line-macbook-air',
    productId: 'p-macbook-air',
    quantity: 1,
    variantLabel: 'Space Gray · 256GB · 8GB',
  },
  {
    id: 'line-sony-xm5',
    productId: 'p-sony-xm5',
    quantity: 2,
    variantLabel: 'Silver · Wireless',
  },
  {
    id: 'line-watch-10',
    productId: 'p-watch-10',
    quantity: 1,
    variantLabel: 'GPS · 46mm · Black',
  },
];

export const cartRecommendationIds: readonly string[] = [
  'p-air-force',
  'p-watch-10',
  'p-sony-xm5',
  'p-backpack',
  'p-airpods',
];
