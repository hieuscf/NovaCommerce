import { describe, expect, it, vi } from 'vitest';
import { InventoryItem } from '../../domain/aggregates/inventory-item';
import { Quantity } from '../../domain/value-objects/quantity';
import { ReservationId } from '../../domain/value-objects/reservation-id';
import { Sku } from '../../domain/value-objects/sku';
import { WarehouseId } from '../../domain/value-objects/warehouse-id';
import { ReleaseStockHandler } from './release-stock.handler';

describe('ReleaseStockHandler', () => {
  it('releases reservation and emits stock release domain events on save', async () => {
    const reservationId = ReservationId.create('55555555-5555-5555-5555-555555555555');
    const item = InventoryItem.create(
      '11111111-1111-1111-1111-111111111111',
      Sku.create('NOVA-HP-001'),
      WarehouseId.create('22222222-2222-2222-2222-222222222222'),
      Quantity.create(10),
    ).getValue();
    item.reserve('res-1', reservationId, 'order-1', Quantity.create(2));

    const repository = {
      findById: vi.fn().mockResolvedValue(item),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const handler = new ReleaseStockHandler(repository);
    const result = await handler.execute({
      inventoryItemId: item.id,
      reservationId: reservationId.value,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().reserved).toBe(0);
    expect(repository.save).toHaveBeenCalledOnce();
  });
});
