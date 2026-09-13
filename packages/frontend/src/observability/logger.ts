export type FrontendLogLevel = 'error' | 'warn' | 'info';

export interface FrontendLogEvent {
  readonly level: FrontendLogLevel;
  readonly event: string;
  readonly requestId?: string;
  readonly category?: string;
  readonly context?: Readonly<Record<string, unknown>>;
}

export type FrontendLogReporter = (event: FrontendLogEvent) => void;

const SENSITIVE_KEY_PATTERN =
  /password|passwd|secret|token|authorization|cookie|refresh|access[_-]?token/i;

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY_PATTERN.test(key)) {
    return '[redacted]';
  }
  return value;
}

export function redactContext(
  context?: Readonly<Record<string, unknown>>,
): Record<string, unknown> | undefined {
  if (!context) {
    return undefined;
  }

  const redacted: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    redacted[key] = redactValue(key, value);
  }
  return redacted;
}

let reporter: FrontendLogReporter | null = null;

export function setFrontendLogReporter(next: FrontendLogReporter | null): void {
  reporter = next;
}

export function reportFrontendEvent(event: FrontendLogEvent): void {
  if (!reporter) {
    return;
  }

  reporter({
    ...event,
    context: redactContext(event.context),
  });
}
