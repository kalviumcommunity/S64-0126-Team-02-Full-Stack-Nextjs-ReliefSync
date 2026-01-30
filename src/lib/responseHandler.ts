import { NextResponse } from "next/server";

/**
 * Standardized API Response Structure
 *
 * This module provides utilities for creating consistent API responses
 * across all endpoints in the ReliefSync application.
 */

export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  timestamp: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * Send a standardized success response
 *
 * @param data - The data payload to return
 * @param message - Success message describing the operation
 * @param status - HTTP status code (default: 200)
 * @param pagination - Optional pagination metadata
 * @returns NextResponse with standardized success structure
 */
export const sendSuccess = <T = unknown>(
  data: T,
  message = "Operation completed successfully",
  status = 200,
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
) => {
  const response: SuccessResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    ...(pagination && { pagination }),
  };

  return NextResponse.json(response, { status });
};

/**
 * Send a standardized error response
 *
 * @param message - Error message describing what went wrong
 * @param code - Error code for categorization and tracking
 * @param status - HTTP status code (default: 500)
 * @param details - Optional additional error details or context
 * @returns NextResponse with standardized error structure
 */
export const sendError = (
  message = "An unexpected error occurred",
  code = "INTERNAL_ERROR",
  status = 500,
  details?: unknown
) => {
  const errorObj: { code: string; details?: unknown } = { code };
  if (details !== undefined) {
    errorObj.details = details;
  }

  const response: ErrorResponse = {
    success: false,
    message,
    error: errorObj,
    timestamp: new Date().toISOString(),
  };

  // Log errors for monitoring and debugging
  console.error(`[API Error] ${code}: ${message}`, details);

  return NextResponse.json(response, { status });
};
