import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

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
 * Updates an inventory record by ID
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return sendError("Invalid inventory ID", ERROR_CODES.INVALID_ID, 400);
    }

    const body = await req.json();
    const { quantity, minThreshold, maxCapacity } = body;

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

    if (quantity !== undefined && quantity < 0) {
      return sendError(
        "Quantity cannot be negative",
        ERROR_CODES.INVALID_INPUT,
        400
      );
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(minThreshold !== undefined && { minThreshold }),
        ...(maxCapacity !== undefined && { maxCapacity }),
        lastUpdated: new Date(),
      },
      include: {
        organization: { select: { id: true, name: true } },
        item: true,
      },
    });

    return sendSuccess(updatedInventory, "Inventory updated successfully");
  } catch (error) {
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
