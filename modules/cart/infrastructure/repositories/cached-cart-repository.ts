import type { ICache } from '@novacommerce/building-blocks';
import { Cart } from '../../domain/aggregates/cart';
import { CartItem } from '../../domain/entities/cart-item';
import type { ICartRepository } from '../../domain/repositories/i-cart-repository';
import { CartId } from '../../domain/value-objects/cart-id';
import { Money } from '../../domain/value-objects/money';
import { ProductReference } from '../../domain/value-objects/product-reference';
import { Quantity } from '../../domain/value-objects/quantity';

const DEFAULT_TTL_SECONDS = 3600;

interface CachedCartItem {
  readonly id: string;
  readonly productId: string;
  readonly variantId?: string;
  readonly quantity: number;
  readonly unitPriceAmount: number;
  readonly unitPriceCurrency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface CachedCart {
  readonly id: string;
  readonly customerId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly items: readonly CachedCartItem[];
}

export class CachedCartRepository implements ICartRepository {
  constructor(
    private readonly delegate: ICartRepository,
    private readonly cache: ICache,
    private readonly ttlSeconds = DEFAULT_TTL_SECONDS,
  ) {}

  async findById(id: CartId): Promise<Cart | null> {
    const cacheKey = this.idCacheKey(id.value);
    const cached = await this.cache.get<CachedCart>(cacheKey);
    if (cached) {
      return this.fromCache(cached);
    }

    const cart = await this.delegate.findById(id);
    if (cart) {
      await this.cache.set(cacheKey, this.toCache(cart), this.ttlSeconds);
      if (cart.getCustomerId()) {
        await this.cache.set(this.customerCacheKey(cart.getCustomerId()!), this.toCache(cart), this.ttlSeconds);
      }
    }

    return cart;
  }

  async findByCustomerId(customerId: string): Promise<Cart | null> {
    const cacheKey = this.customerCacheKey(customerId);
    const cached = await this.cache.get<CachedCart>(cacheKey);
    if (cached) {
      return this.fromCache(cached);
    }

    const cart = await this.delegate.findByCustomerId(customerId);
    if (cart) {
      await this.cache.set(cacheKey, this.toCache(cart), this.ttlSeconds);
      await this.cache.set(this.idCacheKey(cart.id), this.toCache(cart), this.ttlSeconds);
    }

    return cart;
  }

  async save(cart: Cart): Promise<void> {
    await this.delegate.save(cart);
    await this.invalidate(cart.id, cart.getCustomerId());
  }

  private async invalidate(cartId: string, customerId?: string): Promise<void> {
    await this.cache.delete(this.idCacheKey(cartId));
    if (customerId) {
      await this.cache.delete(this.customerCacheKey(customerId));
    }
  }

  private idCacheKey(cartId: string): string {
    return `cart:id:${cartId}`;
  }

  private customerCacheKey(customerId: string): string {
    return `cart:customer:${customerId}`;
  }

  private toCache(cart: Cart): CachedCart {
    return {
      id: cart.id,
      customerId: cart.getCustomerId(),
      createdAt: cart.createdAt.toISOString(),
      updatedAt: cart.updatedAt.toISOString(),
      items: cart.getItems().map((item) => ({
        id: item.id,
        productId: item.getProductReference().productId,
        variantId: item.getProductReference().variantId,
        quantity: item.getQuantity().value,
        unitPriceAmount: item.getUnitPrice().amount,
        unitPriceCurrency: item.getUnitPrice().currency,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })),
    };
  }

  private fromCache(cached: CachedCart): Cart {
    return Cart.reconstitute({
      id: cached.id,
      customerId: cached.customerId,
      createdAt: new Date(cached.createdAt),
      updatedAt: new Date(cached.updatedAt),
      items: cached.items.map((item) =>
        CartItem.reconstitute({
          id: item.id,
          productReference: ProductReference.create(item.productId, item.variantId),
          quantity: Quantity.create(item.quantity),
          unitPrice: Money.create(item.unitPriceAmount, item.unitPriceCurrency),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }),
      ),
    });
  }
}
