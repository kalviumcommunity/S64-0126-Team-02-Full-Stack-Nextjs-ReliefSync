/**
 * Structured Logger Utility
 *
 * Provides consistent, structured logging across the application.
 * Logs are formatted as JSON with consistent metadata (level, timestamp, context).
 *
 * Usage:
 * logger.info("User login successful", { userId: "123", email: "user@example.com" })
 * logger.error("Database connection failed", { message: error.message, duration: 5000 })
 */

interface LogMeta {
  [key: string]: unknown;
}

interface LogEntry {
  level: "info" | "error" | "warn" | "debug";
  message: string;
  meta?: LogMeta;
  timestamp: string;
}

const formatLog = (
  level: string,
  message: string,
  meta?: LogMeta
): LogEntry => {
  return {
    level: level as "info" | "error" | "warn" | "debug",
    message,
    meta,
    timestamp: new Date().toISOString(),
  };
};

export const logger = {
  /**
   * Log informational messages
   */
  info: (message: string, meta?: LogMeta) => {
    const logEntry = formatLog("info", message, meta);
    console.log(JSON.stringify(logEntry));
  },

  /**
   * Log error messages with full details
   * In production, stack traces are typically redacted by the error handler
   */
  error: (message: string, meta?: LogMeta) => {
    const logEntry = formatLog("error", message, meta);
    console.error(JSON.stringify(logEntry));
  },

  /**
   * Log warning messages
   */
  warn: (message: string, meta?: LogMeta) => {
    const logEntry = formatLog("warn", message, meta);
    console.warn(JSON.stringify(logEntry));
  },

  /**
   * Log debug messages (typically only in development)
   */
  debug: (message: string, meta?: LogMeta) => {
    if (process.env.NODE_ENV === "development") {
      const logEntry = formatLog("debug", message, meta);
      console.debug(JSON.stringify(logEntry));
    }
  },
};
