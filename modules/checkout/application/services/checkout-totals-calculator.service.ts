export interface CheckoutTotalsInputLine {
  readonly unitPriceAmount: number;
  readonly quantity: number;
}

export interface CheckoutTotalsInputAdjustment {
  readonly type: string;
  readonly amount: number;
}

export interface CheckoutTotals {
  readonly subtotalAmount: number;
  readonly totalAmount: number;
}

export function calculateCheckoutTotals(
  lines: readonly CheckoutTotalsInputLine[],
  adjustments: readonly CheckoutTotalsInputAdjustment[],
): CheckoutTotals {
  const subtotalAmount = lines.reduce((total, line) => total + line.unitPriceAmount * line.quantity, 0);

  const discountAmount = adjustments
    .filter((adjustment) => adjustment.type === 'discount')
    .reduce((total, adjustment) => total + adjustment.amount, 0);

  const shippingAmount = adjustments
    .filter((adjustment) => adjustment.type === 'shipping')
    .reduce((total, adjustment) => total + adjustment.amount, 0);

  const taxAmount = adjustments
    .filter((adjustment) => adjustment.type === 'tax')
    .reduce((total, adjustment) => total + adjustment.amount, 0);

  const totalAmount = Math.max(0, subtotalAmount - discountAmount + shippingAmount + taxAmount);

  return { subtotalAmount, totalAmount };
}
