import { z } from "zod";

/**
 * Item Categories enum for validation
 */
export const ItemCategoryEnum = z.enum([
  "FOOD",
  "MEDICINE",
  "WATER",
  "SHELTER",
  "CLOTHING",
  "HYGIENE",
  "TOOLS",
  "OTHER",
]);

/**
 * Item Units enum for validation
 */
export const ItemUnitEnum = z.enum([
  "KG", // Kilograms
  "LITER", // Liters
  "UNIT", // Individual units
  "BOX", // Boxes
  "PACKET", // Packets
]);

/**
 * Inventory Item Creation Schema
 * Validates input for creating new inventory items (master catalog)
 */
export const createInventoryItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable(),
  category: ItemCategoryEnum,
  unit: ItemUnitEnum,
});

/**
 * Inventory Item Update Schema
 * Validates input for updating existing inventory items
 */
export const updateInventoryItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters")
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional()
    .nullable(),
  category: ItemCategoryEnum.optional(),
  unit: ItemUnitEnum.optional(),
});

export type CreateInventoryItemInput = z.infer<
  typeof createInventoryItemSchema
>;
export type UpdateInventoryItemInput = z.infer<
  typeof updateInventoryItemSchema
>;
