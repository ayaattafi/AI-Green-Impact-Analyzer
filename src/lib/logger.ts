/**
 * Single choke point for client-side error/warning logging. Swaps to a real
 * telemetry sink (Sentry, LogRocket, etc.) in one place later without
 * touching call sites.
 */
type LogContext = Record<string, unknown>;

function format(scope: string, message: string, context?: LogContext): string {
  return context ? `[${scope}] ${message} ${JSON.stringify(context)}` : `[${scope}] ${message}`;
}

export const logger = {
  error(scope: string, message: string, error?: unknown, context?: LogContext) {
    console.error(format(scope, message, context), error);
  },
  warn(scope: string, message: string, context?: LogContext) {
    console.warn(format(scope, message, context));
  },
  info(scope: string, message: string, context?: LogContext) {
    console.info(format(scope, message, context));
  },
};
