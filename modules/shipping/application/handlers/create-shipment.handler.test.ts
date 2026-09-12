import { describe, expect, it, vi } from 'vitest';
import { Shipment, ShipmentStatus } from '../../domain/aggregates/shipment';
import { Address } from '../../domain/value-objects/address';
import { CarrierCode } from '../../domain/value-objects/carrier-code';
import type { IShipmentRepository } from '../../domain/repositories/i-shipment-repository';
import { CreateShipmentHandler } from './create-shipment.handler';

describe('CreateShipmentHandler', () => {
  const destination = {
    line1: '123 Main St',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    country: 'US',
  };

  it('creates shipment and persists it', async () => {
    const save = vi.fn();
    const repository: IShipmentRepository = {
      findById: vi.fn(),
      findByOrderId: vi.fn().mockResolvedValue(null),
      findByTrackingNumber: vi.fn(),
      save,
    };

    const handler = new CreateShipmentHandler(repository);
    const result = await handler.execute({
      orderId: '22222222-2222-2222-2222-222222222222',
      carrierCode: 'standard',
      destination,
      items: [{ orderLineId: '44444444-4444-4444-4444-444444444444', quantity: 2 }],
    });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().status).toBe(ShipmentStatus.CREATED);
    expect(save).toHaveBeenCalledOnce();
  });

  it('rejects duplicate shipment for order', async () => {
    const existing = Shipment.create(
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      CarrierCode.create('standard'),
      Address.create(destination),
    ).getValue();

    const repository: IShipmentRepository = {
      findById: vi.fn(),
      findByOrderId: vi.fn().mockResolvedValue(existing),
      findByTrackingNumber: vi.fn(),
      save: vi.fn(),
    };

    const handler = new CreateShipmentHandler(repository);
    const result = await handler.execute({
      orderId: '22222222-2222-2222-2222-222222222222',
      carrierCode: 'standard',
      destination,
      items: [{ orderLineId: '44444444-4444-4444-4444-444444444444', quantity: 1 }],
    });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('SHIPMENT_ALREADY_EXISTS');
  });
});
