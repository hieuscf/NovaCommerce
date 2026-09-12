import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { Prisma, PrismaClient, ReservationStatus as PrismaReservationStatus } from '@prisma/client';
import { InventoryItem } from '../../domain/aggregates/inventory-item';
import { StockAdjustment } from '../../domain/entities/stock-adjustment';
import { ReservationStatus, StockReservation } from '../../domain/entities/stock-reservation';
import type { IInventoryItemRepository } from '../../domain/repositories/i-inventory-item-repository';
import { Quantity } from '../../domain/value-objects/quantity';
import { ReservationId } from '../../domain/value-objects/reservation-id';
import { Sku } from '../../domain/value-objects/sku';
import { WarehouseId } from '../../domain/value-objects/warehouse-id';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type InventoryItemRow = Prisma.InventoryItemGetPayload<{
  include: {
    reservations: true;
    adjustments: true;
  };
}>;

export class PrismaInventoryItemRepository implements IInventoryItemRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: string): Promise<InventoryItem | null> {
    const row = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findBySkuAndWarehouse(sku: Sku, warehouseId: WarehouseId): Promise<InventoryItem | null> {
    const row = await this.prisma.inventoryItem.findUnique({
      where: {
        sku_warehouseId: {
          sku: sku.value,
          warehouseId: warehouseId.value,
        },
      },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findWithActiveReservationsForOrder(orderId: string): Promise<InventoryItem[]> {
    const rows = await this.prisma.inventoryItem.findMany({
      where: {
        reservations: {
          some: {
            orderId,
            status: 'active',
          },
        },
      },
      include: this.defaultInclude(),
    });
    return rows.map((row) => this.toDomain(row));
  }

  async save(item: InventoryItem): Promise<void> {
    const events = item.pullDomainEvents();

    await this.prisma.$transaction(async (tx) => {
      await tx.inventoryItem.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          sku: item.getSku().value,
          warehouseId: item.getWarehouseId().value,
          onHand: item.getOnHand().value,
          reserved: item.getReserved().value,
        },
        update: {
          sku: item.getSku().value,
          warehouseId: item.getWarehouseId().value,
          onHand: item.getOnHand().value,
          reserved: item.getReserved().value,
        },
      });

      await this.syncReservations(tx, item);
      await this.syncAdjustments(tx, item);

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(item.id, event)));
      }
    });
  }

  private async syncReservations(tx: Prisma.TransactionClient, item: InventoryItem): Promise<void> {
    const existing = await tx.stockReservation.findMany({ where: { inventoryItemId: item.id } });
    const desiredIds = new Set(item.getReservations().map((reservation) => reservation.id));

    for (const reservation of item.getReservations()) {
      await tx.stockReservation.upsert({
        where: { id: reservation.id },
        create: {
          id: reservation.id,
          inventoryItemId: item.id,
          reservationId: reservation.getReservationId().value,
          orderId: reservation.getOrderId(),
          quantity: reservation.getQuantity().value,
          status: reservation.getStatus() as PrismaReservationStatus,
        },
        update: {
          reservationId: reservation.getReservationId().value,
          orderId: reservation.getOrderId(),
          quantity: reservation.getQuantity().value,
          status: reservation.getStatus() as PrismaReservationStatus,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.stockReservation.delete({ where: { id: row.id } });
      }
    }
  }

  private async syncAdjustments(tx: Prisma.TransactionClient, item: InventoryItem): Promise<void> {
    const existing = await tx.stockAdjustment.findMany({ where: { inventoryItemId: item.id } });
    const desiredIds = new Set(item.getAdjustments().map((adjustment) => adjustment.id));

    for (const adjustment of item.getAdjustments()) {
      await tx.stockAdjustment.upsert({
        where: { id: adjustment.id },
        create: {
          id: adjustment.id,
          inventoryItemId: item.id,
          delta: adjustment.getDelta(),
          reason: adjustment.getReason(),
        },
        update: {
          delta: adjustment.getDelta(),
          reason: adjustment.getReason(),
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.stockAdjustment.delete({ where: { id: row.id } });
      }
    }
  }

  private defaultInclude() {
    return {
      reservations: true,
      adjustments: true,
    } as const;
  }

  private toDomain(row: InventoryItemRow): InventoryItem {
    return InventoryItem.reconstitute({
      id: row.id,
      sku: Sku.create(row.sku),
      warehouseId: WarehouseId.create(row.warehouseId),
      onHand: Quantity.create(row.onHand),
      reserved: Quantity.create(row.reserved),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      reservations: row.reservations.map((reservation) =>
        StockReservation.reconstitute({
          id: reservation.id,
          reservationId: ReservationId.create(reservation.reservationId),
          orderId: reservation.orderId,
          quantity: Quantity.create(reservation.quantity),
          status: reservation.status as ReservationStatus,
          createdAt: reservation.createdAt,
          updatedAt: reservation.updatedAt,
        }),
      ),
      adjustments: row.adjustments.map((adjustment) =>
        StockAdjustment.reconstitute({
          id: adjustment.id,
          delta: adjustment.delta,
          reason: adjustment.reason,
          createdAt: adjustment.createdAt,
          updatedAt: adjustment.updatedAt,
        }),
      ),
    });
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'InventoryItem',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
