import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { ShippingDomainError } from '../errors/shipping-domain.error';
import { ShipmentItem } from '../entities/shipment-item';
import { TrackingRecord } from '../entities/tracking-record';
import { ShipmentCreatedEvent } from '../events/shipment-created.event';
import { ShipmentDeliveredEvent } from '../events/shipment-delivered.event';
import { ShipmentDispatchedEvent } from '../events/shipment-dispatched.event';
import { ShipmentInTransitEvent } from '../events/shipment-in-transit.event';
import type { Address } from '../value-objects/address';
import type { CarrierCode } from '../value-objects/carrier-code';
import type { TrackingNumber } from '../value-objects/tracking-number';

export enum ShipmentStatus { CREATED = 'created', DISPATCHED = 'dispatched', IN_TRANSIT = 'in_transit', DELIVERED = 'delivered' }

export class Shipment extends AggregateRoot<string> {
  private items: ShipmentItem[] = [];
  private trackingRecords: TrackingRecord[] = [];

  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private orderId: string, private carrierCode: CarrierCode,
    private destination: Address, private status: ShipmentStatus,
    private trackingNumber?: TrackingNumber,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, orderId: string, carrierCode: CarrierCode, destination: Address): Result<Shipment, ShippingDomainError> {
    if (!orderId?.trim()) {
      return Result.fail(new ShippingDomainError('Order id is required', 'INVALID_ORDER_ID'));
    }
    const now = new Date();
    const shipment = new Shipment(id, now, now, orderId.trim(), carrierCode, destination, ShipmentStatus.CREATED);
    shipment.addDomainEvent(new ShipmentCreatedEvent(id, now, { orderId: orderId.trim(), carrierCode: carrierCode.value }));
    return Result.ok(shipment);
  }

  static reconstitute(props: {
    id: string; orderId: string; carrierCode: CarrierCode; destination: Address; status: ShipmentStatus;
    trackingNumber?: TrackingNumber; createdAt: Date; updatedAt: Date;
    items: ShipmentItem[]; trackingRecords: TrackingRecord[];
  }): Shipment {
    const shipment = new Shipment(props.id, props.createdAt, props.updatedAt, props.orderId, props.carrierCode, props.destination, props.status, props.trackingNumber);
    shipment.items = [...props.items];
    shipment.trackingRecords = [...props.trackingRecords];
    return shipment;
  }

  addItem(item: ShipmentItem): void { this.items.push(item); this.updatedAt = new Date(); }

  dispatch(trackingNumber: TrackingNumber): Result<void, ShippingDomainError> {
    if (this.status !== ShipmentStatus.CREATED) {
      return Result.fail(new ShippingDomainError('Shipment cannot be dispatched', 'INVALID_SHIPMENT_STATE'));
    }
    this.trackingNumber = trackingNumber;
    this.status = ShipmentStatus.DISPATCHED;
    this.updatedAt = new Date();
    this.addDomainEvent(new ShipmentDispatchedEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  markInTransit(record: TrackingRecord): Result<void, ShippingDomainError> {
    if (this.status !== ShipmentStatus.DISPATCHED && this.status !== ShipmentStatus.IN_TRANSIT) {
      return Result.fail(new ShippingDomainError('Shipment cannot be marked in transit', 'INVALID_SHIPMENT_STATE'));
    }
    this.status = ShipmentStatus.IN_TRANSIT;
    this.trackingRecords.push(record);
    this.updatedAt = new Date();
    this.addDomainEvent(new ShipmentInTransitEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  markDelivered(record: TrackingRecord): Result<void, ShippingDomainError> {
    if (this.status === ShipmentStatus.DELIVERED) {
      return Result.fail(new ShippingDomainError('Shipment already delivered', 'SHIPMENT_ALREADY_DELIVERED'));
    }
    this.status = ShipmentStatus.DELIVERED;
    this.trackingRecords.push(record);
    this.updatedAt = new Date();
    this.addDomainEvent(new ShipmentDeliveredEvent(this.id, new Date(), {}));
    return Result.ok(undefined);
  }

  getStatus(): ShipmentStatus { return this.status; }
  getTrackingNumber(): TrackingNumber | undefined { return this.trackingNumber; }
  getItems(): readonly ShipmentItem[] { return this.items; }
}
