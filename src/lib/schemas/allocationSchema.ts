import { z } from "zod";

/**
 * Allocation Status Enum
 * Must match the Prisma schema enum values
 */
const AllocationStatusEnum = z.enum([
  "PENDING",
  "APPROVED",
  "IN_TRANSIT",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]);

/**
 * Allocation Creation Schema
 * Validates input for creating a new allocation request
 */
export const createAllocationSchema = z.object({
  fromOrgId: z
    .number()
    .int("Source organization ID must be an integer")
    .positive("Source organization ID must be positive")
    .optional()
    .nullable(),
  toOrgId: z
    .number()
    .int("Recipient organization ID must be an integer")
    .positive("Recipient organization ID must be positive"),
  itemId: z
    .number()
    .int("Item ID must be an integer")
    .positive("Item ID must be positive"),
  quantity: z
    .number()
    .positive("Quantity must be greater than 0")
    .finite("Quantity must be a valid number"),
  requestedBy: z
    .string()
    .min(2, "Requester name/email must be at least 2 characters")
    .max(100, "Requester name/email must not exceed 100 characters")
    .trim(),
  notes: z
    .string()
    .max(1000, "Notes must not exceed 1000 characters")
    .trim()
    .optional()
    .nullable(),
}).refine(
  (data) => {
    // Ensure fromOrgId and toOrgId are different if fromOrgId is provided
    if (data.fromOrgId) {
      return data.fromOrgId !== data.toOrgId;
    }
    return true;
  },
  {
    message: "Source and recipient organizations must be different",
    path: ["toOrgId"],
  }
);

/**
 * Allocation Update Schema
 * Validates input for updating an existing allocation
 * Used for status changes and approval/completion workflows
 */
export const updateAllocationSchema = z.object({
  status: AllocationStatusEnum.optional(),
  approvedBy: z
    .number()
    .int("Approver ID must be an integer")
    .positive("Approver ID must be positive")
    .optional()
    .nullable(),
  approvedDate: z
    .string()
    .datetime("Invalid approval date format")
    .optional()
    .nullable(),
  completedDate: z
    .string()
    .datetime("Invalid completion date format")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, "Notes must not exceed 1000 characters")
    .trim()
    .optional()
    .nullable(),
}).refine(
  (data) => {
    // If status is APPROVED, approvedBy must be provided
    if (data.status === "APPROVED" && !data.approvedBy) {
      return false;
    }
    return true;
  },
  {
    message: "Approver ID is required when status is APPROVED",
    path: ["approvedBy"],
  }
).refine(
  (data) => {
    // If status is COMPLETED, completedDate should be provided
    if (data.status === "COMPLETED" && !data.completedDate) {
      return false;
    }
    return true;
  },
  {
    message: "Completion date is required when status is COMPLETED",
    path: ["completedDate"],
  }
);

// Type exports for use in components and API routes
export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;
export type UpdateAllocationInput = z.infer<typeof updateAllocationSchema>;
export type AllocationStatus = z.infer<typeof AllocationStatusEnum>;
