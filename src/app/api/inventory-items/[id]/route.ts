import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateInventoryItemSchema } from "@/lib/schemas/inventoryItemSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleValidationError, handleDatabaseError } from "@/lib/errorHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

/**
 * GET /api/inventory-items/[id]
 * Retrieves a single inventory item by ID
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id, 10);

    if (isNaN(itemId)) {
      return sendError("Invalid item ID", ERROR_CODES.INVALID_ID, 400);
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: {
        inventories: {
          select: {
            id: true,
            quantity: true,
            organizationId: true,
            organization: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: { inventories: true },
        },
      },
    });

    if (!item) {
      return sendError("Inventory item not found", ERROR_CODES.NOT_FOUND, 404);
    }

    return sendSuccess(item, "Inventory item retrieved successfully");
  } catch (error) {
    return handleDatabaseError(error, `GET /api/inventory-items/${params.id}`);
  }
}

/**
 * PATCH /api/inventory-items/[id]
 * Updates an existing inventory item
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id, 10);

    if (isNaN(itemId)) {
      return sendError("Invalid item ID", ERROR_CODES.INVALID_ID, 400);
    }

    const body = await req.json();
    const validatedData = updateInventoryItemSchema.parse(body);

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });

    if (!existingItem) {
      return sendError("Inventory item not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Check for duplicate name/category combination if name or category is being updated
    if (validatedData.name || validatedData.category) {
      const nameToCheck = validatedData.name || existingItem.name;
      const categoryToCheck = validatedData.category || existingItem.category;

      const duplicate = await prisma.inventoryItem.findFirst({
        where: {
          name: {
            equals: nameToCheck,
            mode: "insensitive",
          },
          category: categoryToCheck,
          NOT: { id: itemId },
        },
      });

      if (duplicate) {
        return sendError(
          `Item "${nameToCheck}" already exists in category ${categoryToCheck}`,
          "DUPLICATE_ITEM",
          400
        );
      }
    }

    // Update item
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: validatedData,
      include: {
        _count: {
          select: { inventories: true },
        },
      },
    });

    return sendSuccess(updatedItem, "Inventory item updated successfully");
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(
        error,
        `PATCH /api/inventory-items/${params.id}`
      );
    }
    return handleDatabaseError(
      error,
      `PATCH /api/inventory-items/${params.id}`
    );
  }
}

/**
 * DELETE /api/inventory-items/[id]
 * Deletes an inventory item (only if not used in any inventories)
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemId = parseInt(params.id, 10);

    if (isNaN(itemId)) {
      return sendError("Invalid item ID", ERROR_CODES.INVALID_ID, 400);
    }

    // Check if item exists
    const existingItem = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
      include: {
        _count: {
          select: { inventories: true },
        },
      },
    });

    if (!existingItem) {
      return sendError("Inventory item not found", ERROR_CODES.NOT_FOUND, 404);
    }

    // Prevent deletion if item is used in any inventories (due to Restrict constraint)
    if (existingItem._count.inventories > 0) {
      return sendError(
        `Cannot delete item. It is currently used in ${existingItem._count.inventories} inventory record(s)`,
        "ITEM_IN_USE",
        400
      );
    }

    // Delete item
    await prisma.inventoryItem.delete({
      where: { id: itemId },
    });

    return sendSuccess(null, "Inventory item deleted successfully");
  } catch (error) {
    return handleDatabaseError(
      error,
      `DELETE /api/inventory-items/${params.id}`
    );
  }
}
