import type { SavedPaymentMethod } from '../../domain/aggregates/saved-payment-method';
import type { SavedPaymentMethodResponseDto } from '../dto/saved-payment-method-response.dto';

export function mapSavedPaymentMethodToDto(method: SavedPaymentMethod): SavedPaymentMethodResponseDto {
  return {
    id: method.id,
    brand: method.getBrand(),
    last4: method.getLast4(),
    expMonth: method.getExpMonth(),
    expYear: method.getExpYear(),
    cardholderName: method.getCardholderName(),
    isDefault: method.getIsDefault(),
    createdAt: method.createdAt.toISOString(),
    updatedAt: method.updatedAt.toISOString(),
  };
}
