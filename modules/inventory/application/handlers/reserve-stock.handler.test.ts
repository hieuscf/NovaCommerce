import { describe, expect, it, vi } from 'vitest';
import { InventoryItem } from '../../domain/aggregates/inventory-item';
import { Quantity } from '../../domain/value-objects/quantity';
import { Sku } from '../../domain/value-objects/sku';
import { WarehouseId } from '../../domain/value-objects/warehouse-id';
import { ReserveStockHandler } from './reserve-stock.handler';

describe('ReserveStockHandler', () => {
  const itemId = '11111111-1111-1111-1111-111111111111';
  const warehouseId = '22222222-2222-2222-2222-222222222222';

  it('reserves stock and persists inventory item', async () => {
    const item = InventoryItem.create(
      itemId,
      Sku.create('NOVA-HP-001'),
      WarehouseId.create(warehouseId),
      Quantity.create(10),
    ).getValue();

    const repository = {
      findBySkuAndWarehouse: vi.fn().mockResolvedValue(item),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const handler = new ReserveStockHandler(repository);
    const result = await handler.execute({
      orderId: '33333333-3333-3333-3333-333333333333',
      sku: 'NOVA-HP-001',
      warehouseId,
      quantity: 4,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().reserved).toBe(4);
    expect(repository.save).toHaveBeenCalledOnce();
  });

  it('returns failure when inventory item is missing', async () => {
    const repository = {
      findBySkuAndWarehouse: vi.fn().mockResolvedValue(null),
      save: vi.fn(),
    };

    const handler = new ReserveStockHandler(repository);
    const result = await handler.execute({
      orderId: '33333333-3333-3333-3333-333333333333',
      sku: 'MISSING',
      warehouseId,
      quantity: 1,
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INVENTORY_ITEM_NOT_FOUND');
  });
});
