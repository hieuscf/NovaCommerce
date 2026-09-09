import { BaseEntity } from '@novacommerce/building-blocks';

export class TrackingRecord extends BaseEntity<string> {
  private constructor(
    id: string, createdAt: Date, updatedAt: Date,
    private status: string, private location: string, private recordedAt: Date,
  ) { super(id, createdAt, updatedAt); }

  static create(id: string, status: string, location: string, recordedAt: Date): TrackingRecord {
    return new TrackingRecord(id, new Date(), new Date(), status, location, recordedAt);
  }

  getStatus(): string { return this.status; }
  getLocation(): string { return this.location; }
  getRecordedAt(): Date { return this.recordedAt; }
}
