import { BaseEntity } from '@novacommerce/building-blocks';
import type { DisplayName } from '../value-objects/display-name';
import type { PhoneNumber } from '../value-objects/phone-number';

export class UserProfile extends BaseEntity<string> {
  private constructor(
    id: string,
    createdAt: Date,
    updatedAt: Date,
    private displayName: DisplayName,
    private phoneNumber?: PhoneNumber,
    private avatarUrl?: string,
  ) {
    super(id, createdAt, updatedAt);
  }

  static create(id: string, displayName: DisplayName, phoneNumber?: PhoneNumber, avatarUrl?: string): UserProfile {
    return new UserProfile(id, new Date(), new Date(), displayName, phoneNumber, avatarUrl);
  }

  updateDisplayName(displayName: DisplayName): void {
    this.displayName = displayName;
    this.updatedAt = new Date();
  }

  getDisplayName(): DisplayName { return this.displayName; }
  getPhoneNumber(): PhoneNumber | undefined { return this.phoneNumber; }
  getAvatarUrl(): string | undefined { return this.avatarUrl; }
}
