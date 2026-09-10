export class InfrastructureError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ConfigurationError extends InfrastructureError {
  constructor(message: string, cause?: unknown) {
    super(message, 'CONFIGURATION_ERROR', cause);
  }
}

export class AvailabilityError extends InfrastructureError {
  constructor(message: string, cause?: unknown) {
    super(message, 'AVAILABILITY_ERROR', cause);
  }
}
