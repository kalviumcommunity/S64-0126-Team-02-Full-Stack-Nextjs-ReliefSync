import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateInventorySchema } from "@/lib/schemas/inventorySchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { createValidationErrorResponse } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/inventory/:id
 * Retrieves a specific inventory record by ID
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return sendError("Invalid inventory ID", ERROR_CODES.INVALID_ID, 400);
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        organization: true,
        item: true,
      },
    });

    if (!inventory) {
      return sendError(
        "Inventory record not found",
        ERROR_CODES.INVENTORY_NOT_FOUND,
        404
      );
    }

    return sendSuccess(inventory, "Inventory retrieved successfully");
  } catch (error) {
    return sendError(
      "Failed to retrieve inventory",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}

/**
 * PUT /api/inventory/:id
 * Updates an inventory record by ID with Zod validation
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return sendError("Invalid inventory ID", ERROR_CODES.INVALID_ID, 400);
    }

    const body = await req.json();

    // Validate request body with Zod
    const validatedData = updateInventorySchema.parse(body);

    // Check if inventory exists
    const existingInventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!existingInventory) {
      return sendError(
        "Inventory record not found",
        ERROR_CODES.INVENTORY_NOT_FOUND,
        404
      );
    }

    // Update inventory
    const updatedInventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        ...validatedData,
        lastUpdated: new Date(),
      },
      include: {
        organization: { select: { id: true, name: true } },
        item: true,
      },
    });

    return sendSuccess(updatedInventory, "Inventory updated successfully");
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error updating inventory:", error);
    return sendError(
      "Failed to update inventory",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}

/**
 * DELETE /api/inventory/:id
 * Deletes an inventory record by ID
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return sendError("Invalid inventory ID", ERROR_CODES.INVALID_ID, 400);
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!existingInventory) {
      return sendError(
        "Inventory record not found",
        ERROR_CODES.INVENTORY_NOT_FOUND,
        404
      );
    }

    await prisma.inventory.delete({ where: { id: inventoryId } });

    return sendSuccess(null, "Inventory record deleted successfully");
  } catch (error) {
    return sendError(
      "Failed to delete inventory",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}
