import { isApiClientError } from '@novacommerce/frontend';
import { authSession, restoreSession } from '@/lib/auth/session';
import { cartClient } from '@/lib/cart/client';
import { userClient } from '@/lib/user/client';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isLiveCatalogProductId(productId: string): boolean {
  return UUID_RE.test(productId);
}

export interface AddProductToCartInput {
  readonly productId: string;
  readonly unitPriceAmount: number;
  readonly unitPriceCurrency: string;
  readonly quantity?: number;
  readonly variantId?: string;
}

export type AddProductToCartResult =
  | { status: 'added' }
  | { status: 'login_required' }
  | { status: 'unsupported_product' }
  | { status: 'error'; message: string };

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

/**
 * Adds a catalog product to the authenticated Gateway cart.
 * Shop/PDP buttons call this instead of toast-only stubs.
 */
export async function addProductToCart(
  input: AddProductToCartInput,
): Promise<AddProductToCartResult> {
  if (!isLiveCatalogProductId(input.productId)) {
    return { status: 'unsupported_product' };
  }

  if (input.variantId && !isLiveCatalogProductId(input.variantId)) {
    return { status: 'unsupported_product' };
  }

  let snapshot = authSession.getSnapshot();
  if (snapshot.status === 'loading') {
    snapshot = await restoreSession();
  }
  if (!snapshot.isAuthenticated) {
    return { status: 'login_required' };
  }

  try {
    await ensureCustomerProfile();
    await cartClient.addItem({
      productId: input.productId,
      variantId: input.variantId,
      quantity: input.quantity && input.quantity > 0 ? input.quantity : 1,
      unitPriceAmount: input.unitPriceAmount,
      unitPriceCurrency: input.unitPriceCurrency || 'USD',
    });
    return { status: 'added' };
  } catch (error) {
    if (isApiClientError(error)) {
      return { status: 'error', message: error.message };
    }
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Could not add to cart',
    };
  }
}
