import { describe, expect, it } from 'vitest';
import { StockAdjustedEvent } from '../events/stock-adjusted.event';
import { StockDepletedEvent } from '../events/stock-depleted.event';
import { StockReservationReleasedEvent } from '../events/stock-reservation-released.event';
import { StockReservedEvent } from '../events/stock-reserved.event';
import { Quantity } from '../value-objects/quantity';
import { ReservationId } from '../value-objects/reservation-id';
import { Sku } from '../value-objects/sku';
import { WarehouseId } from '../value-objects/warehouse-id';
import { InventoryItem } from './inventory-item';

describe('InventoryItem aggregate', () => {
  const itemId = '11111111-1111-1111-1111-111111111111';
  const warehouseId = WarehouseId.create('22222222-2222-2222-2222-222222222222');
  const sku = Sku.create('NOVA-HP-001');

  function createItem(onHand = 10) {
    return InventoryItem.create(itemId, sku, warehouseId, Quantity.create(onHand)).getValue();
  }

  it('creates inventory item with zero reserved stock', () => {
    const item = createItem();
    expect(item.getOnHand().value).toBe(10);
    expect(item.getReserved().value).toBe(0);
    expect(item.getAvailableQuantity()).toBe(10);
  });

  it('adjusts stock and emits StockAdjusted', () => {
    const item = createItem();
    const result = item.adjust(5, 'Restock', 'adj-1');
    expect(result.isSuccess).toBe(true);
    expect(item.getOnHand().value).toBe(15);

    const events = item.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(StockAdjustedEvent);
  });

  it('rejects adjustment that makes on-hand negative', () => {
    const item = createItem(2);
    const result = item.adjust(-5, 'Damage', 'adj-2');
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INSUFFICIENT_STOCK');
  });

  it('emits StockDepleted when on-hand reaches zero', () => {
    const item = createItem(3);
    item.adjust(-3, 'Write-off', 'adj-3');
    const events = item.pullDomainEvents();
    expect(events.some((event) => event instanceof StockDepletedEvent)).toBe(true);
  });

  it('reserves stock and emits StockReserved', () => {
    const item = createItem();
    const reservationId = ReservationId.create('33333333-3333-3333-3333-333333333333');
    const result = item.reserve('res-entity-1', reservationId, 'order-1', Quantity.create(3));
    expect(result.isSuccess).toBe(true);
    expect(item.getReserved().value).toBe(3);
    expect(item.getAvailableQuantity()).toBe(7);

    const events = item.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(StockReservedEvent);
    expect((events[0] as StockReservedEvent).payload.orderId).toBe('order-1');
  });

  it('rejects reservation exceeding available stock', () => {
    const item = createItem(2);
    const result = item.reserve(
      'res-entity-2',
      ReservationId.create('44444444-4444-4444-4444-444444444444'),
      'order-2',
      Quantity.create(3),
    );
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INSUFFICIENT_STOCK');
  });

  it('releases reservation and emits StockReservationReleased', () => {
    const item = createItem();
    const reservationId = ReservationId.create('55555555-5555-5555-5555-555555555555');
    item.reserve('res-entity-3', reservationId, 'order-3', Quantity.create(2));
    item.pullDomainEvents();

    const result = item.releaseReservation(reservationId);
    expect(result.isSuccess).toBe(true);
    expect(item.getReserved().value).toBe(0);

    const events = item.pullDomainEvents();
    expect(events[0]).toBeInstanceOf(StockReservationReleasedEvent);
  });

  it('releases all active reservations for an order', () => {
    const item = createItem(20);
    item.reserve(
      'res-a',
      ReservationId.create('66666666-6666-6666-6666-666666666666'),
      'order-4',
      Quantity.create(2),
    );
    item.reserve(
      'res-b',
      ReservationId.create('77777777-7777-7777-7777-777777777777'),
      'order-4',
      Quantity.create(3),
    );
    item.pullDomainEvents();

    const result = item.releaseReservationsForOrder('order-4');
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toHaveLength(2);
    expect(item.getReserved().value).toBe(0);
  });
});
