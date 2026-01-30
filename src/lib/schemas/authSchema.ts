import { z } from "zod";

/**
 * Signup Schema
 * Validates input for user registration
 */
export const signupSchema = z.object({
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
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must not exceed 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
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
 * Login Schema
 * Validates input for user authentication
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

/**
 * Type inference for Signup input
 */
export type SignupInput = z.infer<typeof signupSchema>;

/**
 * Type inference for Login input
 */
export type LoginInput = z.infer<typeof loginSchema>;
