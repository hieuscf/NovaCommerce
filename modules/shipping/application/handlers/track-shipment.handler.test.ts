import { describe, expect, it, vi } from 'vitest';
import { Shipment } from '../../domain/aggregates/shipment';
import { ShipmentItem } from '../../domain/entities/shipment-item';
import type { IShipmentRepository } from '../../domain/repositories/i-shipment-repository';
import { Address } from '../../domain/value-objects/address';
import { CarrierCode } from '../../domain/value-objects/carrier-code';
import { TrackingNumber } from '../../domain/value-objects/tracking-number';
import { TrackShipmentHandler } from './track-shipment.handler';

describe('TrackShipmentHandler', () => {
  const destination = Address.create({
    line1: '123 Main St',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    country: 'US',
  });

  function createTrackedShipment() {
    const shipment = Shipment.create(
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      CarrierCode.create('standard'),
      destination,
    ).getValue();
    shipment.addItem(ShipmentItem.create('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 1));
    shipment.dispatch(TrackingNumber.create('TRACK-001'));
    shipment.pullDomainEvents();
    return shipment;
  }

  it('returns shipment by id', async () => {
    const shipment = createTrackedShipment();
    const repository: IShipmentRepository = {
      findById: vi.fn().mockResolvedValue(shipment),
      findByOrderId: vi.fn(),
      findByTrackingNumber: vi.fn(),
      save: vi.fn(),
    };

    const handler = new TrackShipmentHandler(repository);
    const result = await handler.executeById({ shipmentId: shipment.id });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().trackingNumber).toBe('TRACK-001');
  });

  it('returns shipment by tracking number', async () => {
    const shipment = createTrackedShipment();
    const repository: IShipmentRepository = {
      findById: vi.fn(),
      findByOrderId: vi.fn(),
      findByTrackingNumber: vi.fn().mockResolvedValue(shipment),
      save: vi.fn(),
    };

    const handler = new TrackShipmentHandler(repository);
    const result = await handler.executeByTrackingNumber({ trackingNumber: 'TRACK-001' });

    expect(result.isSuccess).toBe(true);
    expect(result.getValue().id).toBe(shipment.id);
  });

  it('returns not found when shipment is missing', async () => {
    const repository: IShipmentRepository = {
      findById: vi.fn().mockResolvedValue(null),
      findByOrderId: vi.fn(),
      findByTrackingNumber: vi.fn(),
      save: vi.fn(),
    };

    const handler = new TrackShipmentHandler(repository);
    const result = await handler.executeById({ shipmentId: 'missing-id' });

    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('SHIPMENT_NOT_FOUND');
  });
});
