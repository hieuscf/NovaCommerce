export interface LogContext {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly userId?: string;
  readonly module?: string;
  readonly [key: string]: unknown;
}

export interface ILogger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext, error?: Error): void;
}
