/**
 * Schema Exports
 * 
 * This file re-exports all Zod validation schemas for easy importing
 * throughout the application. Schemas can be used on both client and server.
 */

// User schemas and types
export {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from "./userSchema";

// Organization schemas and types
export {
  createOrganizationSchema,
  updateOrganizationSchema,
  type CreateOrganizationInput,
  type UpdateOrganizationInput,
} from "./organizationSchema";

// Inventory schemas and types
export {
  createInventorySchema,
  updateInventorySchema,
  type CreateInventoryInput,
  type UpdateInventoryInput,
} from "./inventorySchema";

// Allocation schemas and types
export {
  createAllocationSchema,
  updateAllocationSchema,
  type CreateAllocationInput,
  type UpdateAllocationInput,
  type AllocationStatus,
} from "./allocationSchema";
