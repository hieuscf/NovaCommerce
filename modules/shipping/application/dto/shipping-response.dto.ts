export interface ShippingQuoteResponseDto {
  readonly methodCode: string;
  readonly methodName: string;
  readonly amount: number;
  readonly currency: string;
  readonly estimatedDays: number;
}

export interface ShipmentItemResponseDto {
  readonly id: string;
  readonly orderLineId: string;
  readonly quantity: number;
}

export interface TrackingRecordResponseDto {
  readonly id: string;
  readonly status: string;
  readonly location: string;
  readonly recordedAt: string;
}

export interface ShipmentResponseDto {
  readonly id: string;
  readonly orderId: string;
  readonly carrierCode: string;
  readonly status: string;
  readonly trackingNumber?: string;
  readonly destination: {
    readonly line1: string;
    readonly line2?: string;
    readonly city: string;
    readonly state: string;
    readonly postalCode: string;
    readonly country: string;
  };
  readonly items: readonly ShipmentItemResponseDto[];
  readonly trackingRecords: readonly TrackingRecordResponseDto[];
  readonly createdAt: string;
  readonly updatedAt: string;
}
