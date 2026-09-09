import { ValueObject } from '@novacommerce/building-blocks';
import { PromotionDomainError } from '../errors/promotion-domain.error';

export class DateRange extends ValueObject<{ start: Date; end: Date }> {
  private constructor(props: { start: Date; end: Date }) { super(props); }

  static create(start: Date, end: Date): DateRange {
    if (!(start instanceof Date) || !(end instanceof Date) || start >= end) {
      throw new PromotionDomainError('Invalid date range', 'INVALID_DATE_RANGE');
    }
    return new DateRange({ start, end });
  }

  get start(): Date { return this.props.start; }
  get end(): Date { return this.props.end; }

  contains(date: Date): boolean {
    return date >= this.props.start && date <= this.props.end;
  }
}
