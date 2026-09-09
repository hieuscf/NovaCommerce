export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationError[];
}

export function validationSuccess(): ValidationResult {
  return { isValid: true, errors: [] };
}

export function validationFailure(errors: readonly ValidationError[]): ValidationResult {
  return { isValid: false, errors };
}
