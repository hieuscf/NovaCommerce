export abstract class ValueObject<TProps extends Record<string, unknown>> {
  protected readonly props: Readonly<TProps>;

  protected constructor(props: TProps) {
    this.props = Object.freeze({ ...props });
  }

  equals(other?: ValueObject<TProps> | null): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    if (other.constructor !== this.constructor) {
      return false;
    }
    return this.shallowEqual(this.props, other.props);
  }

  private shallowEqual(a: TProps, b: TProps): boolean {
    const keysA = Object.keys(a) as Array<keyof TProps>;
    const keysB = Object.keys(b) as Array<keyof TProps>;
    if (keysA.length !== keysB.length) {
      return false;
    }
    return keysA.every((key) => Object.is(a[key], b[key]));
  }
}
