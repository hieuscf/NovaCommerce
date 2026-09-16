import { isApiClientError } from '@novacommerce/frontend';
import { catalogClient } from '@/lib/catalog/client';
import { loadPublishedCatalog } from '@/lib/catalog/load-published-catalog';
import { buildCategoryIndex, mapProductToViewModel } from '@/lib/catalog/mappers';
import type { ProductDto } from '@/lib/catalog/types';
import { cartClient } from '@/lib/cart/client';
import { CART_CRUMBS, mapCartToPageViewModel } from '@/lib/cart/mappers';
import type { CartDto } from '@/lib/cart/types';
import { cartFixtureLines, cartRecommendationIds, type CartFixtureLine } from '@/lib/mock-data/cart';
import { catalogProducts } from '@/lib/mock-data/catalog';
import { userClient } from '@/lib/user/client';
import {
  summarizeCart,
  type CartLineViewModel,
  type CartPageViewModel,
} from '@/lib/view-models/cart';
import type { ProductViewModel } from '@/lib/view-models/product';

const RECOMMENDATION_LIMIT = 5;

function fixtureToLine(fixture: CartFixtureLine, product: ProductViewModel): CartLineViewModel {
  return {
    id: fixture.id,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.imageUrl,
    variantLabel: fixture.variantLabel,
    unitPrice: product.price,
    quantity: fixture.quantity,
    currency: product.currency,
    inStock: product.inStock !== false,
    selected: fixture.selected !== false,
  };
}

/**
 * Sync fixture builder for checkout / UI tests until those surfaces use Cart Gateway.
 */
export function getCartPageFromFixtures(
  fixtures: readonly CartFixtureLine[] = cartFixtureLines,
): CartPageViewModel {
  const productsById = new Map(catalogProducts.map((product) => [product.id, product]));
  const lines = fixtures.flatMap((fixture) => {
    const product = productsById.get(fixture.productId);
    return product ? [fixtureToLine(fixture, product)] : [];
  });

  const recommendations = cartRecommendationIds.flatMap((id) => {
    const product = productsById.get(id);
    return product ? [product] : [];
  });

  return {
    crumbs: CART_CRUMBS,
    lines,
    summary: summarizeCart(lines),
    recommendations,
  };
}

async function ensureCustomerProfile(): Promise<void> {
  try {
    await userClient.getAccount();
  } catch (error) {
    if (!isApiClientError(error) || error.status !== 404) {
      throw error;
    }
    await userClient.createProfile({ displayName: 'Customer' });
  }
}

async function loadProductMap(productIds: readonly string[]): Promise<{
  productsById: Map<string, ProductDto>;
  productViewsById: Map<string, ProductViewModel>;
}> {
  const uniqueIds = [...new Set(productIds)];
  const productsById = new Map<string, ProductDto>();
  const productViewsById = new Map<string, ProductViewModel>();

  if (uniqueIds.length === 0) {
    return { productsById, productViewsById };
  }

  const results = await Promise.all(
    uniqueIds.map(async (productId) => {
      try {
        const product = await catalogClient.getProductById(productId);
        return { productId, product };
      } catch {
        return { productId, product: undefined };
      }
    }),
  );

  const categoryIndex = buildCategoryIndex([]);
  for (const entry of results) {
    if (!entry.product) {
      continue;
    }
    productsById.set(entry.productId, entry.product);
    productViewsById.set(entry.productId, mapProductToViewModel(entry.product, categoryIndex));
  }

  return { productsById, productViewsById };
}

async function loadRecommendations(
  cartProductIds: ReadonlySet<string>,
): Promise<readonly ProductViewModel[]> {
  try {
    const catalog = await loadPublishedCatalog();
    return catalog.viewModels
      .filter((product) => !cartProductIds.has(product.id))
      .slice(0, RECOMMENDATION_LIMIT);
  } catch {
    return [];
  }
}

export async function mapCartDtoToPage(cart: CartDto): Promise<CartPageViewModel> {
  const { productsById, productViewsById } = await loadProductMap(
    cart.items.map((item) => item.productId),
  );
  const recommendations = await loadRecommendations(
    new Set(cart.items.map((item) => item.productId)),
  );
  return mapCartToPageViewModel(cart, productsById, productViewsById, recommendations);
}

/**
 * Loads the authenticated customer cart from Gateway `GET /users/me/cart`.
 * Creates a User profile on 404 so get-or-create cart can proceed.
 * Unexpected failures must throw so the cart error UI can recover.
 */
export async function getCartPage(): Promise<CartPageViewModel> {
  await ensureCustomerProfile();
  const cart = await cartClient.getCart();
  return mapCartDtoToPage(cart);
}

/** Presentation badge count until the header listens to live cart state. */
export function getCartLineCount(
  fixtures: readonly CartFixtureLine[] = cartFixtureLines,
): number {
  return getCartPageFromFixtures(fixtures).summary.itemCount;
}
