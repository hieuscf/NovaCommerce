import { AggregateRoot, Result } from '@novacommerce/building-blocks';
import { InventoryDomainError } from '../errors/inventory-domain.error';
import { StockAdjustment } from '../entities/stock-adjustment';
import { ReservationStatus, StockReservation } from '../entities/stock-reservation';
import { StockAdjustedEvent } from '../events/stock-adjusted.event';
import { StockDepletedEvent } from '../events/stock-depleted.event';
import { StockReservationReleasedEvent } from '../events/stock-reservation-released.event';
import { StockReservedEvent } from '../events/stock-reserved.event';
import { Quantity } from '../value-objects/quantity';
import type { ReservationId } from '../value-objects/reservation-id';
import type { Sku } from '../value-objects/sku';
import type { WarehouseId } from '../value-objects/warehouse-id';

export class InventoryItem extends AggregateRoot<string> {
  private reservations: StockReservation[] = [];
  private adjustments: StockAdjustment[] = [];

  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private sku: Sku, private warehouseId: WarehouseId,
    private onHand: Quantity, private reserved: Quantity,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, sku: Sku, warehouseId: WarehouseId, onHand: Quantity): Result<InventoryItem, InventoryDomainError> {
    return Result.ok(new InventoryItem(id, new Date(), new Date(), sku, warehouseId, onHand, Quantity.create(0)));
  }

  static reconstitute(props: {
    id: string; sku: Sku; warehouseId: WarehouseId; onHand: Quantity; reserved: Quantity;
    createdAt: Date; updatedAt: Date; reservations: StockReservation[]; adjustments: StockAdjustment[];
  }): InventoryItem {
    const item = new InventoryItem(props.id, props.createdAt, props.updatedAt, props.sku, props.warehouseId, props.onHand, props.reserved);
    item.reservations = [...props.reservations];
    item.adjustments = [...props.adjustments];
    return item;
  }

  private getAvailable(): number {
    return this.onHand.value - this.reserved.value;
  }

  adjust(delta: Quantity, reason: string, adjustmentId: string): Result<void, InventoryDomainError> {
    const newOnHand = this.onHand.value + delta.value;
    if (newOnHand < 0) {
      return Result.fail(new InventoryDomainError('Available stock cannot be negative', 'INSUFFICIENT_STOCK'));
    }
    this.onHand = Quantity.create(newOnHand);
    this.adjustments.push(StockAdjustment.create(adjustmentId, delta, reason));
    this.updatedAt = new Date();
    this.addDomainEvent(new StockAdjustedEvent(this.id, new Date(), { delta: delta.value, reason }));
    if (this.onHand.value === 0) {
      this.addDomainEvent(new StockDepletedEvent(this.id, new Date(), {}));
    }
    return Result.ok(undefined);
  }

  reserve(reservationEntityId: string, reservationId: ReservationId, orderId: string, quantity: Quantity): Result<void, InventoryDomainError> {
    if (quantity.value <= 0) {
      return Result.fail(new InventoryDomainError('Reservation quantity must be positive', 'INVALID_QUANTITY'));
    }
    if (this.getAvailable() < quantity.value) {
      return Result.fail(new InventoryDomainError('Insufficient available stock', 'INSUFFICIENT_STOCK'));
    }
    this.reserved = Quantity.create(this.reserved.value + quantity.value);
    this.reservations.push(StockReservation.create(reservationEntityId, reservationId, orderId, quantity));
    this.updatedAt = new Date();
    this.addDomainEvent(new StockReservedEvent(this.id, new Date(), { orderId, quantity: quantity.value }));
    return Result.ok(undefined);
  }

  releaseReservation(reservationId: ReservationId): Result<void, InventoryDomainError> {
    const reservation = this.reservations.find(
      (r) => r.getReservationId().value === reservationId.value && r.getStatus() === ReservationStatus.ACTIVE,
    );
    if (!reservation) {
      return Result.fail(new InventoryDomainError('Active reservation not found', 'RESERVATION_NOT_FOUND'));
    }
    reservation.release();
    this.reserved = Quantity.create(this.reserved.value - reservation.getQuantity().value);
    this.updatedAt = new Date();
    this.addDomainEvent(new StockReservationReleasedEvent(this.id, new Date(), { reservationId: reservationId.value }));
    return Result.ok(undefined);
  }

  getSku(): Sku { return this.sku; }
  getOnHand(): Quantity { return this.onHand; }
  getReserved(): Quantity { return this.reserved; }
  getAvailableQuantity(): number { return this.getAvailable(); }
}
