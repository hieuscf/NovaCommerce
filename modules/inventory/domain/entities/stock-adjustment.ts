import { BaseEntity } from '@novacommerce/building-blocks';

export class StockAdjustment extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private delta: number, private reason: string,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, delta: number, reason: string): StockAdjustment {
    return new StockAdjustment(id, new Date(), new Date(), delta, reason);
  }

  static reconstitute(props: {
    id: string;
    delta: number;
    reason: string;
    createdAt: Date;
    updatedAt: Date;
  }): StockAdjustment {
    return new StockAdjustment(props.id, props.createdAt, props.updatedAt, props.delta, props.reason);
  }

  getDelta(): number { return this.delta; }
  getReason(): string { return this.reason; }
}
