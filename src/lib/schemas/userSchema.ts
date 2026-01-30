import { z } from "zod";

/**
 * User Creation Schema
 * Validates input for creating a new user
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must not exceed 100 characters"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  passwordHash: z
    .string()
    .min(8, "Password hash must be at least 8 characters"),
  role: z.enum(["NGO", "GOVERNMENT"], {
    message: "Role must be either NGO or GOVERNMENT",
  }),
  organizationId: z
    .number()
    .int("Organization ID must be an integer")
    .positive("Organization ID must be positive")
    .optional()
    .nullable(),
});

/**
 * User Update Schema
 * Validates input for updating an existing user
 * All fields are optional for partial updates
 */
export const updateUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(5, "Email must be at least 5 characters")
    .max(100, "Email must not exceed 100 characters")
    .optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .trim()
    .optional(),
  passwordHash: z
    .string()
    .min(8, "Password hash must be at least 8 characters")
    .optional(),
  role: z
    .enum(["NGO", "GOVERNMENT"], {
      message: "Role must be either NGO or GOVERNMENT",
    })
    .optional(),
  organizationId: z
    .number()
    .int("Organization ID must be an integer")
    .positive("Organization ID must be positive")
    .optional()
    .nullable(),
});

// Type exports for use in components and API routes
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
