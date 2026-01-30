import { z } from "zod";

/**
 * Organization Creation Schema
 * Validates input for creating a new organization
 */
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(200, "Organization name must not exceed 200 characters")
    .trim(),
  registrationNo: z
    .string()
    .min(3, "Registration number must be at least 3 characters")
    .max(50, "Registration number must not exceed 50 characters")
    .trim()
    .regex(/^[A-Z0-9-\/]+$/i, "Registration number must contain only alphanumeric characters, hyphens, and slashes"),
  contactEmail: z
    .string()
    .email("Invalid contact email address")
    .max(100, "Contact email must not exceed 100 characters"),
  contactPhone: z
    .string()
    .min(10, "Contact phone must be at least 10 characters")
    .max(20, "Contact phone must not exceed 20 characters")
    .regex(/^[\d\s\-\+\(\)]+$/, "Contact phone must contain only digits, spaces, hyphens, plus signs, and parentheses"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must not exceed 500 characters")
    .trim(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must not exceed 100 characters")
    .trim(),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(100, "State must not exceed 100 characters")
    .trim(),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must not exceed 100 characters")
    .trim()
    .default("India"),
  isActive: z.boolean().default(true),
});

/**
 * Organization Update Schema
 * Validates input for updating an existing organization
 * All fields are optional for partial updates
 */
export const updateOrganizationSchema = z.object({
  name: z
    .string()
    .min(2, "Organization name must be at least 2 characters")
    .max(200, "Organization name must not exceed 200 characters")
    .trim()
    .optional(),
  registrationNo: z
    .string()
    .min(3, "Registration number must be at least 3 characters")
    .max(50, "Registration number must not exceed 50 characters")
    .trim()
    .regex(/^[A-Z0-9-\/]+$/i, "Registration number must contain only alphanumeric characters, hyphens, and slashes")
    .optional(),
  contactEmail: z
    .string()
    .email("Invalid contact email address")
    .max(100, "Contact email must not exceed 100 characters")
    .optional(),
  contactPhone: z
    .string()
    .min(10, "Contact phone must be at least 10 characters")
    .max(20, "Contact phone must not exceed 20 characters")
    .regex(/^[\d\s\-\+\(\)]+$/, "Contact phone must contain only digits, spaces, hyphens, plus signs, and parentheses")
    .optional(),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(500, "Address must not exceed 500 characters")
    .trim()
    .optional(),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City must not exceed 100 characters")
    .trim()
    .optional(),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(100, "State must not exceed 100 characters")
    .trim()
    .optional(),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must not exceed 100 characters")
    .trim()
    .optional(),
  isActive: z.boolean().optional(),
});

// Type exports for use in components and API routes
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;
