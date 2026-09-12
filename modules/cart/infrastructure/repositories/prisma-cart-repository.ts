import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { Prisma, PrismaClient } from '@prisma/client';
import { Cart } from '../../domain/aggregates/cart';
import { CartItem } from '../../domain/entities/cart-item';
import type { ICartRepository } from '../../domain/repositories/i-cart-repository';
import { CartId } from '../../domain/value-objects/cart-id';
import { Money } from '../../domain/value-objects/money';
import { ProductReference } from '../../domain/value-objects/product-reference';
import { Quantity } from '../../domain/value-objects/quantity';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type CartRow = Prisma.CartGetPayload<{ include: { items: true } }>;

export class PrismaCartRepository implements ICartRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: CartId): Promise<Cart | null> {
    const row = await this.prisma.cart.findUnique({
      where: { id: id.value },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findByCustomerId(customerId: string): Promise<Cart | null> {
    const row = await this.prisma.cart.findFirst({
      where: { customerId },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async save(cart: Cart): Promise<void> {
    const events = cart.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.cart.upsert({
        where: { id: cart.id },
        create: {
          id: cart.id,
          customerId: cart.getCustomerId(),
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt,
        },
        update: {
          customerId: cart.getCustomerId(),
          updatedAt: cart.updatedAt,
        },
      });

      await this.syncItems(tx, cart);

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(cart.id, event)));
      }
    });
  }

  private async syncItems(tx: Prisma.TransactionClient, cart: Cart): Promise<void> {
    const existing = await tx.cartItem.findMany({ where: { cartId: cart.id } });
    const desiredIds = new Set(cart.getItems().map((item) => item.id));

    for (const item of cart.getItems()) {
      const productReference = item.getProductReference();
      const unitPrice = item.getUnitPrice();

      await tx.cartItem.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          cartId: cart.id,
          productId: productReference.productId,
          variantId: productReference.variantId ?? null,
          quantity: item.getQuantity().value,
          unitPriceAmount: unitPrice.amount,
          unitPriceCurrency: unitPrice.currency,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
        update: {
          productId: productReference.productId,
          variantId: productReference.variantId ?? null,
          quantity: item.getQuantity().value,
          unitPriceAmount: unitPrice.amount,
          unitPriceCurrency: unitPrice.currency,
          updatedAt: item.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.cartItem.delete({ where: { id: row.id } });
      }
    }
  }

  private defaultInclude() {
    return { items: true } as const;
  }

  private toDomain(row: CartRow): Cart {
    return Cart.reconstitute({
      id: row.id,
      customerId: row.customerId ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      items: row.items.map((item) =>
        CartItem.reconstitute({
          id: item.id,
          productReference: ProductReference.create(item.productId, item.variantId ?? undefined),
          quantity: Quantity.create(item.quantity),
          unitPrice: Money.create(Number(item.unitPriceAmount), item.unitPriceCurrency),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }),
      ),
    });
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'Cart',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
