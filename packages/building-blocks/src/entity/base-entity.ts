export abstract class BaseEntity<TId> {
  protected constructor(
    public readonly id: TId,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  equals(other?: BaseEntity<TId> | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return this.id === other.id;
  }
}
