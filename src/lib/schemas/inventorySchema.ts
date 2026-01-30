import { z } from "zod";

/**
 * Inventory Creation Schema
 * Validates input for creating or updating inventory records
 */
export const createInventorySchema = z.object({
  organizationId: z
    .number()
    .int("Organization ID must be an integer")
    .positive("Organization ID must be positive"),
  itemId: z
    .number()
    .int("Item ID must be an integer")
    .positive("Item ID must be positive"),
  quantity: z
    .number()
    .nonnegative("Quantity cannot be negative")
    .finite("Quantity must be a valid number"),
  minThreshold: z
    .number()
    .nonnegative("Minimum threshold cannot be negative")
    .finite("Minimum threshold must be a valid number")
    .default(0),
  maxCapacity: z
    .number()
    .positive("Maximum capacity must be positive")
    .finite("Maximum capacity must be a valid number")
    .optional()
    .nullable(),
}).refine(
  (data) => {
    // If maxCapacity is provided, it must be greater than or equal to quantity
    if (data.maxCapacity !== null && data.maxCapacity !== undefined) {
      return data.maxCapacity >= data.quantity;
    }
    return true;
  },
  {
    message: "Maximum capacity must be greater than or equal to current quantity",
    path: ["maxCapacity"],
  }
).refine(
  (data) => {
    // minThreshold should not exceed quantity
    return data.minThreshold <= data.quantity;
  },
  {
    message: "Minimum threshold should not exceed current quantity",
    path: ["minThreshold"],
  }
);

/**
 * Inventory Update Schema
 * Validates input for updating existing inventory records
 * All fields except IDs are optional for partial updates
 */
export const updateInventorySchema = z.object({
  quantity: z
    .number()
    .nonnegative("Quantity cannot be negative")
    .finite("Quantity must be a valid number")
    .optional(),
  minThreshold: z
    .number()
    .nonnegative("Minimum threshold cannot be negative")
    .finite("Minimum threshold must be a valid number")
    .optional(),
  maxCapacity: z
    .number()
    .positive("Maximum capacity must be positive")
    .finite("Maximum capacity must be a valid number")
    .optional()
    .nullable(),
}).refine(
  (data) => {
    // If both maxCapacity and quantity are provided, validate their relationship
    if (
      data.maxCapacity !== null &&
      data.maxCapacity !== undefined &&
      data.quantity !== undefined
    ) {
      return data.maxCapacity >= data.quantity;
    }
    return true;
  },
  {
    message: "Maximum capacity must be greater than or equal to current quantity",
    path: ["maxCapacity"],
  }
).refine(
  (data) => {
    // If both minThreshold and quantity are provided, validate their relationship
    if (data.minThreshold !== undefined && data.quantity !== undefined) {
      return data.minThreshold <= data.quantity;
    }
    return true;
  },
  {
    message: "Minimum threshold should not exceed current quantity",
    path: ["minThreshold"],
  }
);

// Type exports for use in components and API routes
export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
