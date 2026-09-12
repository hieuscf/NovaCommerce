import type { Shipment } from '../../domain/aggregates/shipment';
import type { ShipmentResponseDto } from '../dto/shipping-response.dto';

export function mapShipmentToDto(shipment: Shipment): ShipmentResponseDto {
  const destination = shipment.getDestination();
  const trackingNumber = shipment.getTrackingNumber();

  return {
    id: shipment.id,
    orderId: shipment.getOrderId(),
    carrierCode: shipment.getCarrierCode().value,
    status: shipment.getStatus(),
    trackingNumber: trackingNumber?.value,
    destination: {
      line1: destination.line1,
      line2: destination.line2,
      city: destination.city,
      state: destination.state,
      postalCode: destination.postalCode,
      country: destination.country,
    },
    items: shipment.getItems().map((item) => ({
      id: item.id,
      orderLineId: item.getOrderLineId(),
      quantity: item.getQuantity(),
    })),
    trackingRecords: shipment.getTrackingRecords().map((record) => ({
      id: record.id,
      status: record.getStatus(),
      location: record.getLocation(),
      recordedAt: record.getRecordedAt().toISOString(),
    })),
    createdAt: shipment.createdAt.toISOString(),
    updatedAt: shipment.updatedAt.toISOString(),
  };
}
