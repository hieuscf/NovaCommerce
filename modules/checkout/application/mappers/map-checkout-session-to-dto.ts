import type { CheckoutSession } from '../../domain/aggregates/checkout-session';
import type { CheckoutResponseDto } from '../dto/checkout-response.dto';
import { calculateCheckoutTotals } from '../services/checkout-totals-calculator.service';

export function mapCheckoutSessionToDto(session: CheckoutSession): CheckoutResponseDto {
  const lines = session.getLines().map((line) => ({
    id: line.id,
    productId: line.getProductId(),
    variantId: line.getVariantId(),
    quantity: line.getQuantity(),
    unitPriceAmount: line.getUnitPriceAmount(),
    currency: line.getCurrency(),
    lineTotalAmount: line.getUnitPriceAmount() * line.getQuantity(),
  }));

  const adjustments = session.getAdjustments().map((adjustment) => ({
    id: adjustment.id,
    type: adjustment.getType(),
    label: adjustment.getLabel(),
    amount: adjustment.getAmount(),
    currency: adjustment.getCurrency(),
  }));

  const currency = lines[0]?.currency;
  const totals = calculateCheckoutTotals(lines, adjustments);

  return {
    id: session.id,
    cartId: session.getCartId(),
    customerId: undefined,
    status: session.getStatus(),
    lines,
    adjustments,
    subtotalAmount: totals.subtotalAmount,
    totalAmount: totals.totalAmount,
    currency,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
  };
}

export function mapCheckoutSessionToDtoWithCustomer(
  session: CheckoutSession,
  customerId?: string,
): CheckoutResponseDto {
  return {
    ...mapCheckoutSessionToDto(session),
    customerId,
  };
}
