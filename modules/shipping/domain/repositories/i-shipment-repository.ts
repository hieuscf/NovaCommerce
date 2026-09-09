import type { Shipment } from '../aggregates/shipment';
import type { TrackingNumber } from '../value-objects/tracking-number';

export interface IShipmentRepository {
  findById(id: string): Promise<Shipment | null>;
  findByTrackingNumber(trackingNumber: TrackingNumber): Promise<Shipment | null>;
  save(shipment: Shipment): Promise<void>;
}
