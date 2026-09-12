import { randomUUID } from 'node:crypto';
import type { DomainEvent, IOutboxStore, OutboxMessage } from '@novacommerce/building-blocks';
import type { Prisma, PrismaClient } from '@prisma/client';
import { Shipment, ShipmentStatus } from '../../domain/aggregates/shipment';
import { ShipmentItem } from '../../domain/entities/shipment-item';
import { TrackingRecord } from '../../domain/entities/tracking-record';
import type { IShipmentRepository } from '../../domain/repositories/i-shipment-repository';
import { Address } from '../../domain/value-objects/address';
import { CarrierCode } from '../../domain/value-objects/carrier-code';
import { TrackingNumber } from '../../domain/value-objects/tracking-number';
import { PrismaOutboxStoreInTransaction } from '../prisma/prisma-outbox-store';

type ShipmentRow = Prisma.ShipmentGetPayload<{
  include: {
    items: true;
    tracking: true;
  };
}>;

export class PrismaShipmentRepository implements IShipmentRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly outboxStore: IOutboxStore,
  ) {}

  async findById(id: string): Promise<Shipment | null> {
    const row = await this.prisma.shipment.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findByOrderId(orderId: string): Promise<Shipment | null> {
    const row = await this.prisma.shipment.findFirst({
      where: { orderId },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async findByTrackingNumber(trackingNumber: TrackingNumber): Promise<Shipment | null> {
    const row = await this.prisma.shipment.findFirst({
      where: { trackingNumber: trackingNumber.value },
      include: this.defaultInclude(),
    });
    return row ? this.toDomain(row) : null;
  }

  async save(shipment: Shipment): Promise<void> {
    const events = shipment.pullDomainEvents();
    const destination = shipment.getDestination();

    await this.prisma.$transaction(async (tx) => {
      await tx.shipment.upsert({
        where: { id: shipment.id },
        create: {
          id: shipment.id,
          orderId: shipment.getOrderId(),
          carrierCode: shipment.getCarrierCode().value,
          trackingNumber: shipment.getTrackingNumber()?.value ?? null,
          status: shipment.getStatus(),
          destLine1: destination.line1,
          destLine2: destination.line2 ?? null,
          destCity: destination.city,
          destState: destination.state,
          destPostalCode: destination.postalCode,
          destCountry: destination.country,
          createdAt: shipment.createdAt,
          updatedAt: shipment.updatedAt,
        },
        update: {
          carrierCode: shipment.getCarrierCode().value,
          trackingNumber: shipment.getTrackingNumber()?.value ?? null,
          status: shipment.getStatus(),
          destLine1: destination.line1,
          destLine2: destination.line2 ?? null,
          destCity: destination.city,
          destState: destination.state,
          destPostalCode: destination.postalCode,
          destCountry: destination.country,
          updatedAt: shipment.updatedAt,
        },
      });

      await this.syncItems(tx, shipment);
      await this.syncTrackingRecords(tx, shipment);

      if (events.length > 0) {
        const outboxStore = new PrismaOutboxStoreInTransaction(tx);
        await outboxStore.save(events.map((event) => this.toOutboxMessage(shipment.id, event)));
      }
    });
  }

  private async syncItems(tx: Prisma.TransactionClient, shipment: Shipment): Promise<void> {
    const existing = await tx.shipmentItem.findMany({ where: { shipmentId: shipment.id } });
    const desiredIds = new Set(shipment.getItems().map((item) => item.id));

    for (const item of shipment.getItems()) {
      await tx.shipmentItem.upsert({
        where: { id: item.id },
        create: {
          id: item.id,
          shipmentId: shipment.id,
          orderLineId: item.getOrderLineId(),
          quantity: item.getQuantity(),
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
        update: {
          orderLineId: item.getOrderLineId(),
          quantity: item.getQuantity(),
          updatedAt: item.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.shipmentItem.delete({ where: { id: row.id } });
      }
    }
  }

  private async syncTrackingRecords(tx: Prisma.TransactionClient, shipment: Shipment): Promise<void> {
    const existing = await tx.trackingRecord.findMany({ where: { shipmentId: shipment.id } });
    const desiredIds = new Set(shipment.getTrackingRecords().map((record) => record.id));

    for (const record of shipment.getTrackingRecords()) {
      await tx.trackingRecord.upsert({
        where: { id: record.id },
        create: {
          id: record.id,
          shipmentId: shipment.id,
          status: record.getStatus(),
          location: record.getLocation(),
          recordedAt: record.getRecordedAt(),
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        },
        update: {
          status: record.getStatus(),
          location: record.getLocation(),
          recordedAt: record.getRecordedAt(),
          updatedAt: record.updatedAt,
        },
      });
    }

    for (const row of existing) {
      if (!desiredIds.has(row.id)) {
        await tx.trackingRecord.delete({ where: { id: row.id } });
      }
    }
  }

  private defaultInclude() {
    return {
      items: true,
      tracking: true,
    } as const;
  }

  private toDomain(row: ShipmentRow): Shipment {
    return Shipment.reconstitute({
      id: row.id,
      orderId: row.orderId,
      carrierCode: CarrierCode.create(row.carrierCode),
      destination: Address.create({
        line1: row.destLine1,
        line2: row.destLine2 ?? undefined,
        city: row.destCity,
        state: row.destState,
        postalCode: row.destPostalCode,
        country: row.destCountry,
      }),
      status: row.status as ShipmentStatus,
      trackingNumber: row.trackingNumber ? TrackingNumber.create(row.trackingNumber) : undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      items: row.items.map((item) =>
        ShipmentItem.create(item.id, item.orderLineId, item.quantity),
      ),
      trackingRecords: row.tracking.map((record) =>
        TrackingRecord.create(record.id, record.status, record.location, record.recordedAt),
      ),
    });
  }

  private toOutboxMessage(aggregateId: string, event: DomainEvent): OutboxMessage {
    return {
      id: randomUUID(),
      aggregateId,
      aggregateType: 'Shipment',
      eventType: event.eventName,
      payload: 'payload' in event ? (event as { payload: unknown }).payload : {},
      occurredOn: event.occurredOn,
    };
  }
}
