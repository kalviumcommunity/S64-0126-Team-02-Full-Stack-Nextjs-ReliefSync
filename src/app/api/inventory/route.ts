import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { createInventorySchema } from "@/lib/schemas/inventorySchema";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/validation";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

/**
 * GET /api/inventory
 * Retrieves all inventory records with pagination and filtering
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const organizationId = searchParams.get("organizationId");
    const skip = (page - 1) * limit;

    const where = organizationId
      ? { organizationId: parseInt(organizationId, 10) }
      : undefined;

    const [inventories, total] = await Promise.all([
      prisma.inventory.findMany({
        ...(where && { where }),
        include: {
          organization: { select: { id: true, name: true } },
          item: true,
        },
        skip,
        take: limit,
        orderBy: { lastUpdated: "desc" },
      }),
      prisma.inventory.count(where ? { where } : undefined),
    ]);

    return sendSuccess(inventories, "Inventory retrieved successfully", 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
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
 * POST /api/inventory
 * Creates or updates an inventory record with Zod validation
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = createInventorySchema.parse(body);

    // Check if organization exists
    const org = await prisma.organization.findUnique({
      where: { id: validatedData.organizationId },
    });
    if (!org) {
      return createErrorResponse("Organization not found", 404);
    }

    // Check if inventory item exists
    const item = await prisma.inventoryItem.findUnique({
      where: { id: validatedData.itemId },
    });
    if (!item) {
      return createErrorResponse("Inventory item not found", 404);
    }

    // Upsert inventory record
    const inventory = await prisma.inventory.upsert({
      where: {
        organizationId_itemId: {
          organizationId: validatedData.organizationId,
          itemId: validatedData.itemId,
        },
      },
      update: {
        quantity: validatedData.quantity,
        minThreshold: validatedData.minThreshold,
        maxCapacity: validatedData.maxCapacity,
        lastUpdated: new Date(),
      },
      create: validatedData,
      include: {
        organization: { select: { id: true, name: true } },
        item: true,
      },
    });

    return createSuccessResponse("Inventory updated successfully", inventory, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error creating/updating inventory:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
