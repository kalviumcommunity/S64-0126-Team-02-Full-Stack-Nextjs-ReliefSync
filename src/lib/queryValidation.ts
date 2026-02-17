import { z } from "zod";

/**
 * Standard pagination parameters validation
 */
export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int("Page must be an integer")
    .positive("Page must be positive")
    .default(1),
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .positive("Limit must be positive")
    .max(100, "Limit cannot exceed 100")
    .default(10),
});

/**
 * Validates and sanitizes pagination query parameters
 * Returns validated page and limit, or errors
 */
export function validatePaginationParams(searchParams: URLSearchParams): {
  success: boolean;
  data?: { page: number; limit: number; skip: number };
  errors?: z.ZodIssue[];
} {
  const rawPage = searchParams.get("page");
  const rawLimit = searchParams.get("limit");

  const page = rawPage && rawPage.trim().length > 0 ? rawPage : undefined;
  const limit = rawLimit && rawLimit.trim().length > 0 ? rawLimit : undefined;

  const result = paginationSchema.safeParse({
    page,
    limit,
  });

  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues,
    };
  }

  return {
    success: true,
    data: {
      page: result.data.page,
      limit: result.data.limit,
      skip: (result.data.page - 1) * result.data.limit,
    },
  };
}

/**
 * Validates integer ID parameters
 */
export function validateIntParam(
  value: string | null,
  paramName: string
): { valid: boolean; value?: number; error?: string } {
  if (!value) {
    return { valid: true }; // Optional param
  }

  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) {
    return {
      valid: false,
      error: `${paramName} must be a positive integer`,
    };
  }

  return { valid: true, value: parsed };
}

/**
 * Validates enum parameter against allowed values
 */
export function validateEnumParam<T extends string>(
  value: string | null,
  allowedValues: readonly T[],
  paramName: string
): { valid: boolean; value?: T; error?: string } {
  if (!value) {
    return { valid: true }; // Optional param
  }

  if (!allowedValues.includes(value as T)) {
    return {
      valid: false,
      error: `${paramName} must be one of: ${allowedValues.join(", ")}`,
    };
  }

  return { valid: true, value: value as T };
}

/**
 * Validates boolean parameter
 */
export function validateBooleanParam(
  value: string | null,
  paramName: string
): { valid: boolean; value?: boolean; error?: string } {
  if (!value) {
    return { valid: true }; // Optional param
  }

  if (value !== "true" && value !== "false") {
    return {
      valid: false,
      error: `${paramName} must be either 'true' or 'false'`,
    };
  }

  return { valid: true, value: value === "true" };
}

/**
 * Validates search query string (prevents extremely long queries)
 */
export function validateSearchParam(value: string | null): {
  valid: boolean;
  value?: string;
  error?: string;
} {
  if (!value) {
    return { valid: true }; // Optional param
  }

  const trimmed = value.trim();

  if (trimmed.length > 100) {
    return {
      valid: false,
      error: "Search query must not exceed 100 characters",
    };
  }

  if (trimmed.length < 2) {
    return {
      valid: false,
      error: "Search query must be at least 2 characters",
    };
  }

  return { valid: true, value: trimmed };
}
