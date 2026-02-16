import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";
import * as z from "zod";
import { sendSuccess, sendError } from "./responseHandler";

/**
 * Validation Error Response Interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validates request body against a Zod schema
 * Returns validated data or throws ZodError
 *
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validated data conforming to schema type
 * @throws ZodError if validation fails
 */
export function validateRequest<T>(schema: ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Formats Zod validation errors into a user-friendly structure
 *
 * @param error - ZodError from failed validation
 * @returns Array of formatted validation errors
 */
export function formatZodErrors(error: ZodError): ValidationError[] {
  // Zod v4 uses z.flattenError
  const flattened = z.flattenError(error);
  const errors: ValidationError[] = [];

  // Add field-specific errors
  for (const [field, messages] of Object.entries(flattened.fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      errors.push({ field, message: String(messages[0]) });
    }
  }

  // Add form-level errors (if any)
  if (Array.isArray(flattened.formErrors)) {
    for (const message of flattened.formErrors) {
      errors.push({ field: "_form", message: String(message) });
    }
  }

  return errors;
}

/**
 * Creates a standardized validation error response
 *
 * @param error - ZodError from failed validation
 * @returns NextResponse with formatted error details
 */
export function createValidationErrorResponse(error: ZodError): NextResponse {
  const errors = formatZodErrors(error);
  return sendError("Validation failed", "VALIDATION_ERROR", 400, { errors });
}

/**
 * @deprecated Use sendSuccess from responseHandler.ts instead
 * Creates a standardized success response
 */
export function createSuccessResponse(
  message: string,
  data: unknown,
  status = 200
): NextResponse {
  return sendSuccess(data, message, status);
}

/**
 * @deprecated Use sendError from responseHandler.ts instead
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string,
  status = 500
): NextResponse {
  return sendError(message, "ERROR", status);
}
