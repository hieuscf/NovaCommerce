import { randomUUID } from 'node:crypto';
import type { DomainEvent, OutboxMessage } from '@novacommerce/building-blocks';
import type { PrismaClient } from '@prisma/client';
import { SavedPaymentMethod } from '../../domain/aggregates/saved-payment-method';
import type { ISavedPaymentMethodRepository } from '../../domain/repositories/i-saved-payment-method-repository';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

export class PrismaSavedPaymentMethodRepository implements ISavedPaymentMethodRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<SavedPaymentMethod | null> {
    const row = await this.prisma.savedPaymentMethod.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByCustomerId(customerId: string): Promise<SavedPaymentMethod[]> {
    const rows = await this.prisma.savedPaymentMethod.findMany({
      where: { customerId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(method: SavedPaymentMethod): Promise<void> {
    await this.saveMany([method]);
  }

  async saveMany(methods: readonly SavedPaymentMethod[]): Promise<void> {
    if (methods.length === 0) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      const outbox = new PrismaOutboxStoreInTransaction(tx);
      for (const method of methods) {
        const events = method.pullDomainEvents();
        await tx.savedPaymentMethod.upsert({
          where: { id: method.id },
          create: {
            id: method.id,
            customerId: method.getCustomerId(),
            provider: method.getProvider(),
            providerToken: method.getProviderToken(),
            brand: method.getBrand(),
            last4: method.getLast4(),
            expMonth: method.getExpMonth(),
            expYear: method.getExpYear(),
            cardholderName: method.getCardholderName(),
            isDefault: method.getIsDefault(),
            createdAt: method.createdAt,
            updatedAt: method.updatedAt,
          },
          update: {
            provider: method.getProvider(),
            providerToken: method.getProviderToken(),
            brand: method.getBrand(),
            last4: method.getLast4(),
            expMonth: method.getExpMonth(),
            expYear: method.getExpYear(),
            cardholderName: method.getCardholderName(),
            isDefault: method.getIsDefault(),
            updatedAt: method.updatedAt,
          },
        });
        await outbox.save(this.toOutboxMessages(method.id, events));
      }
    });
  }

  async delete(method: SavedPaymentMethod): Promise<void> {
    const events = method.pullDomainEvents();
    await this.prisma.$transaction(async (tx) => {
      await tx.savedPaymentMethod.delete({ where: { id: method.id } });
      const outbox = new PrismaOutboxStoreInTransaction(tx);
      await outbox.save(this.toOutboxMessages(method.id, events));
    });
  }

  private toDomain(row: {
    id: string;
    customerId: string;
    provider: string;
    providerToken: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
    cardholderName: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): SavedPaymentMethod {
    return SavedPaymentMethod.reconstitute(row);
  }

  private toOutboxMessages(aggregateId: string, events: readonly DomainEvent[]): OutboxMessage[] {
    return events.map((event) => ({
      id: randomUUID(),
      aggregateId,
      aggregateType: 'SavedPaymentMethod',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: 'occurredOn' in event ? (event as { occurredOn: Date }).occurredOn : new Date(),
    }));
  }
}
