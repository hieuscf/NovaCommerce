import type { ILogger, LogContext } from '@novacommerce/building-blocks';

export class ConsoleLogger implements ILogger {
  constructor(private readonly defaultContext: LogContext = {}) {}

  debug(message: string, context?: LogContext): void {
    console.debug(message, { ...this.defaultContext, ...context });
  }

  info(message: string, context?: LogContext): void {
    console.info(message, { ...this.defaultContext, ...context });
  }

  warn(message: string, context?: LogContext): void {
    console.warn(message, { ...this.defaultContext, ...context });
  }

  error(message: string, context?: LogContext, error?: Error): void {
    console.error(message, { ...this.defaultContext, ...context, error: error?.message });
  }
}
