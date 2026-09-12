import { ValueObject } from '@novacommerce/building-blocks';
import { ReturnRefundDomainError } from '../errors/return-refund-domain.error';

export const RETURN_REQUEST_STATUSES = {
  REQUESTED: 'requested',
  APPROVED: 'approved',
  REFUNDED: 'refunded',
  REJECTED: 'rejected',
} as const;

export type ReturnRequestStatusValue = (typeof RETURN_REQUEST_STATUSES)[keyof typeof RETURN_REQUEST_STATUSES];

export class ReturnStatus extends ValueObject<{ value: ReturnRequestStatusValue }> {
  private constructor(props: { value: ReturnRequestStatusValue }) {
    super(props);
  }

  static requested(): ReturnStatus {
    return new ReturnStatus({ value: RETURN_REQUEST_STATUSES.REQUESTED });
  }

  static approved(): ReturnStatus {
    return new ReturnStatus({ value: RETURN_REQUEST_STATUSES.APPROVED });
  }

  static refunded(): ReturnStatus {
    return new ReturnStatus({ value: RETURN_REQUEST_STATUSES.REFUNDED });
  }

  static rejected(): ReturnStatus {
    return new ReturnStatus({ value: RETURN_REQUEST_STATUSES.REJECTED });
  }

  static create(value: string): ReturnStatus {
    const normalized = value?.trim().toLowerCase();
    if (!Object.values(RETURN_REQUEST_STATUSES).includes(normalized as ReturnRequestStatusValue)) {
      throw new ReturnRefundDomainError('Invalid return status', 'INVALID_RETURN_STATUS');
    }
    return new ReturnStatus({ value: normalized as ReturnRequestStatusValue });
  }

  get value(): ReturnRequestStatusValue {
    return this.props.value;
  }

  isRequested(): boolean {
    return this.props.value === RETURN_REQUEST_STATUSES.REQUESTED;
  }

  isApproved(): boolean {
    return this.props.value === RETURN_REQUEST_STATUSES.APPROVED;
  }
}
