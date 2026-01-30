<<<<<<< HEAD
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
=======
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateInventorySchema } from "@/lib/schemas/inventorySchema";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/validation";
>>>>>>> 14c4207 (zod implementation)

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
<<<<<<< HEAD
      return sendError("Invalid inventory ID", ERROR_CODES.INVALID_ID, 400);
=======
      return createErrorResponse("Invalid inventory ID", 400);
>>>>>>> 14c4207 (zod implementation)
    }

    const body = await req.json();

    // Validate request body with Zod
    const validatedData = updateInventorySchema.parse(body);

    // Check if inventory exists
    const existingInventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!existingInventory) {
<<<<<<< HEAD
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
=======
      return createErrorResponse("Inventory record not found", 404);
>>>>>>> 14c4207 (zod implementation)
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

<<<<<<< HEAD
    return sendSuccess(updatedInventory, "Inventory updated successfully");
  } catch (error) {
    return sendError(
      "Failed to update inventory",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
=======
    return createSuccessResponse(
      "Inventory updated successfully",
      updatedInventory
>>>>>>> 14c4207 (zod implementation)
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error updating inventory:", error);
    return createErrorResponse("Internal server error", 500);
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
