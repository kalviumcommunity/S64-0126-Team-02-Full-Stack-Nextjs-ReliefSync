/**
 * Centralized Error Handler
 *
 * Provides a single point for handling, logging, and formatting all application errors.
 *
 * Features:
 * - Categorizes errors by type (Validation, Authentication, Database, etc.)
 * - Development: Returns full stack traces for debugging
 * - Production: Hides sensitive details, logs them internally
 * - Structured logging with context
 *
 * Usage:
 * try {
 *   // ... operation
 * } catch (error) {
 *   return handleError(error, "GET /api/users");
 * }
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { logger } from "./logger";

export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  DATABASE = "DATABASE_ERROR",
  INTERNAL = "INTERNAL_ERROR",
}

interface ErrorContext {
  type?: ErrorType;
  statusCode?: number;
  context: string; // e.g., "GET /api/users", "POST /api/organizations"
  details?: Record<string, unknown>;
}

interface ErrorResponse {
  success: false;
  message: string;
  errorCode?: string;
  stack?: string; // Only in development
}

/**
 * Determine HTTP status code based on error type
 */
function getStatusCode(type?: ErrorType): number {
  switch (type) {
    case ErrorType.VALIDATION:
      return 400;
    case ErrorType.AUTHENTICATION:
      return 401;
    case ErrorType.AUTHORIZATION:
      return 403;
    case ErrorType.NOT_FOUND:
      return 404;
    case ErrorType.CONFLICT:
      return 409;
    case ErrorType.DATABASE:
      return 500;
    default:
      return 500;
  }
}

/**
 * Get user-friendly error message (safe for production)
 */
function getUserMessage(
  errorType?: ErrorType,
  originalMessage?: string
): string {
  const isDev = process.env.NODE_ENV === "development";

  if (isDev) {
    return originalMessage || "An error occurred";
  }

  // Production: Use safe, generic messages
  switch (errorType) {
    case ErrorType.VALIDATION:
      return "Invalid request data. Please check your input.";
    case ErrorType.AUTHENTICATION:
      return "Authentication failed. Please try logging in again.";
    case ErrorType.AUTHORIZATION:
      return "You do not have permission to perform this action.";
    case ErrorType.NOT_FOUND:
      return "The requested resource was not found.";
    case ErrorType.CONFLICT:
      return "A conflict occurred. The resource may already exist.";
    case ErrorType.DATABASE:
      return "A database error occurred. Please try again later.";
    default:
      return "Something went wrong. Please try again later.";
  }
}

/**
 * Handle and categorize errors
 */
export function handleError(error: unknown, errorContext: ErrorContext) {
  const {
    type = ErrorType.INTERNAL,
    statusCode: customStatusCode,
    context,
    details,
  } = errorContext;

  const isDev = process.env.NODE_ENV === "development";
  const statusCode = customStatusCode || getStatusCode(type);

  // Extract error information
  const errorObj = error as Error;
  let errorMessage = errorObj?.message || "Unknown error";
  const errorStack = errorObj?.stack || "";

  // Handle Zod validation errors specially
  if (error instanceof ZodError) {
    const zodErrors = error.issues.map((e) => ({
      path: Array.isArray(e.path) ? e.path.join(".") : e.path,
      message: e.message,
    }));
    errorMessage = "Validation error";
    logger.error(`Validation error in ${context}`, {
      message: errorMessage,
      errors: zodErrors,
      timestamp: new Date().toISOString(),
    });

    const response: ErrorResponse = {
      success: false,
      message: getUserMessage(ErrorType.VALIDATION, errorMessage),
      errorCode: ErrorType.VALIDATION,
      ...(isDev && { stack: JSON.stringify(zodErrors, null, 2) }),
    };

    return NextResponse.json(response, { status: 400 });
  }

  // Log error with full details (for developers/debugging)
  logger.error(`Error in ${context}`, {
    type,
    message: errorMessage,
    stack: isDev ? errorStack : "REDACTED",
    statusCode,
    details,
    timestamp: new Date().toISOString(),
  });

  // Send response with safe message (for users)
  const response: ErrorResponse = {
    success: false,
    message: getUserMessage(type, isDev ? errorMessage : undefined),
    errorCode: type,
    ...(isDev && { stack: errorStack }),
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * Convenience method for common error scenarios
 */
export function createErrorHandler(context: string) {
  return (error: unknown, type?: ErrorType, statusCode?: number) => {
    return handleError(error, {
      type,
      statusCode,
      context,
    });
  };
}

/**
 * Handle database-specific errors
 */
export function handleDatabaseError(error: unknown, context: string) {
  return handleError(error, {
    type: ErrorType.DATABASE,
    context,
  });
}

/**
 * Handle validation errors
 */
export function handleValidationError(error: unknown, context: string) {
  return handleError(error, {
    type: ErrorType.VALIDATION,
    statusCode: 400,
    context,
  });
}

/**
 * Handle authentication errors
 */
export function handleAuthError(error: unknown, context: string) {
  return handleError(error, {
    type: ErrorType.AUTHENTICATION,
    statusCode: 401,
    context,
  });
}

/**
 * Handle authorization errors
 */
export function handleAuthorizationError(error: unknown, context: string) {
  return handleError(error, {
    type: ErrorType.AUTHORIZATION,
    statusCode: 403,
    context,
  });
}
