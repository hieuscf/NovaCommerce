import { describe, expect, it } from 'vitest';
import { ShipmentItem } from '../entities/shipment-item';
import { TrackingRecord } from '../entities/tracking-record';
import { ShipmentCreatedEvent } from '../events/shipment-created.event';
import { ShipmentDeliveredEvent } from '../events/shipment-delivered.event';
import { ShipmentDispatchedEvent } from '../events/shipment-dispatched.event';
import { ShipmentInTransitEvent } from '../events/shipment-in-transit.event';
import { Address } from '../value-objects/address';
import { CarrierCode } from '../value-objects/carrier-code';
import { TrackingNumber } from '../value-objects/tracking-number';
import { Shipment, ShipmentStatus } from './shipment';

describe('Shipment aggregate', () => {
  const shipmentId = '11111111-1111-1111-1111-111111111111';
  const orderId = '22222222-2222-2222-2222-222222222222';
  const carrierCode = CarrierCode.create('standard');
  const destination = Address.create({
    line1: '123 Main St',
    city: 'Austin',
    state: 'TX',
    postalCode: '78701',
    country: 'US',
  });

  function createShipment() {
    return Shipment.create(shipmentId, orderId, carrierCode, destination);
  }

  it('creates shipment with created status and ShipmentCreated event', () => {
    const result = createShipment();
    expect(result.isSuccess).toBe(true);

    const shipment = result.getValue();
    expect(shipment.getStatus()).toBe(ShipmentStatus.CREATED);
    expect(shipment.getOrderId()).toBe(orderId);

    const events = shipment.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ShipmentCreatedEvent);
    expect((events[0] as ShipmentCreatedEvent).payload.orderId).toBe(orderId);
    expect((events[0] as ShipmentCreatedEvent).payload.carrierCode).toBe('standard');
  });

  it('dispatches shipment with tracking number and ShipmentDispatched event', () => {
    const shipment = createShipment().getValue();
    shipment.addItem(ShipmentItem.create('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 2));
    shipment.pullDomainEvents();

    const trackingNumber = TrackingNumber.create('TRACK-001');
    const result = shipment.dispatch(trackingNumber);

    expect(result.isSuccess).toBe(true);
    expect(shipment.getStatus()).toBe(ShipmentStatus.DISPATCHED);
    expect(shipment.getTrackingNumber()?.value).toBe('TRACK-001');

    const events = shipment.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ShipmentDispatchedEvent);
    expect((events[0] as ShipmentDispatchedEvent).payload.trackingNumber).toBe('TRACK-001');
  });

  it('rejects dispatch without items', () => {
    const shipment = createShipment().getValue();
    const result = shipment.dispatch(TrackingNumber.create('TRACK-001'));
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('SHIPMENT_ITEMS_REQUIRED');
  });

  it('marks shipment in transit and emits ShipmentInTransit', () => {
    const shipment = createShipment().getValue();
    shipment.addItem(ShipmentItem.create('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 1));
    shipment.dispatch(TrackingNumber.create('TRACK-001'));
    shipment.pullDomainEvents();

    const record = TrackingRecord.create(
      '55555555-5555-5555-5555-555555555555',
      'in_transit',
      'Regional Hub',
      new Date('2026-01-02T10:00:00.000Z'),
    );

    const result = shipment.markInTransit(record);
    expect(result.isSuccess).toBe(true);
    expect(shipment.getStatus()).toBe(ShipmentStatus.IN_TRANSIT);

    const events = shipment.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ShipmentInTransitEvent);
  });

  it('marks shipment delivered and emits ShipmentDelivered', () => {
    const shipment = createShipment().getValue();
    shipment.addItem(ShipmentItem.create('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 1));
    shipment.dispatch(TrackingNumber.create('TRACK-001'));
    shipment.pullDomainEvents();

    const record = TrackingRecord.create(
      '55555555-5555-5555-5555-555555555555',
      'delivered',
      'Customer Address',
      new Date('2026-01-05T14:00:00.000Z'),
    );

    const result = shipment.markDelivered(record);
    expect(result.isSuccess).toBe(true);
    expect(shipment.getStatus()).toBe(ShipmentStatus.DELIVERED);

    const events = shipment.pullDomainEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(ShipmentDeliveredEvent);
  });

  it('rejects duplicate delivery', () => {
    const shipment = createShipment().getValue();
    shipment.addItem(ShipmentItem.create('33333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 1));
    const record = TrackingRecord.create(
      '55555555-5555-5555-5555-555555555555',
      'delivered',
      'Customer Address',
      new Date(),
    );
    shipment.markDelivered(record);

    const result = shipment.markDelivered(record);
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('SHIPMENT_ALREADY_DELIVERED');
  });
});
