import { ValueObject } from '@novacommerce/building-blocks';
import { InventoryDomainError } from '../errors/inventory-domain.error';

export class ReservationId extends ValueObject<{ value: string }> {
  private constructor(props: { value: string }) {
    super(props);
  }

  static create(value: string): ReservationId {
    const trimmed = value?.trim();
    if (!trimmed) throw new InventoryDomainError('Reservation id is required', 'INVALID_RESERVATION_ID');
    return new ReservationId({ value: trimmed });
  }

  get value(): string {
    return this.props.value;
  }
}
