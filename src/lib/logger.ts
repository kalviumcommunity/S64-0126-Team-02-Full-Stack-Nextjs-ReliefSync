/**
 * Structured Logger Utility
 *
 * Provides consistent, structured logging across the application.
 * Logs are formatted as JSON with consistent metadata (level, timestamp, context, correlationId).
 *
 * Usage:
 * logger.info("User login successful", { userId: "123", email: "user@example.com" })
 * logger.error("Database connection failed", { message: error.message, duration: 5000 })
 *
 * With correlation ID:
 * logger.info("Request processed", { userId: "123" }, correlationId)
 */

interface LogMeta {
  [key: string]: unknown;
}

interface LogEntry {
  level: "info" | "error" | "warn" | "debug";
  message: string;
  meta?: LogMeta;
  timestamp: string;
  correlationId?: string;
}

/**
 * Generate a unique correlation ID for request tracking
 * Format: timestamp-random (e.g., 1234567890-abc123)
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`;
}

/**
 * Extract correlation ID from request headers
 * Checks x-correlation-id or x-request-id headers
 */
export function getCorrelationId(req: Request): string | undefined {
  const headers = req.headers;
  return (
    headers.get("x-correlation-id") || headers.get("x-request-id") || undefined
  );
}

const formatLog = (
  level: string,
  message: string,
  meta?: LogMeta,
  correlationId?: string
): LogEntry => {
  return {
    level: level as "info" | "error" | "warn" | "debug",
    message,
    meta,
    timestamp: new Date().toISOString(),
    ...(correlationId && { correlationId }),
  };
};

export const logger = {
  /**
   * Log informational messages
   */
  info: (message: string, meta?: LogMeta, correlationId?: string) => {
    const logEntry = formatLog("info", message, meta, correlationId);
    console.log(JSON.stringify(logEntry));
  },

  /**
   * Log error messages with full details
   * In production, stack traces are typically redacted by the error handler
   */
  error: (message: string, meta?: LogMeta, correlationId?: string) => {
    const logEntry = formatLog("error", message, meta, correlationId);
    console.error(JSON.stringify(logEntry));
  },

  /**
   * Log warning messages
   */
  warn: (message: string, meta?: LogMeta, correlationId?: string) => {
    const logEntry = formatLog("warn", message, meta, correlationId);
    console.warn(JSON.stringify(logEntry));
  },

  /**
   * Log debug messages (typically only in development)
   */
  debug: (message: string, meta?: LogMeta, correlationId?: string) => {
    if (process.env.NODE_ENV === "development") {
      const logEntry = formatLog("debug", message, meta, correlationId);
      console.debug(JSON.stringify(logEntry));
    }
  },
};
