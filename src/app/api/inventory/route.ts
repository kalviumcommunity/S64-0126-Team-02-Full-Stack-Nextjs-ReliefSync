import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { createInventorySchema } from "@/lib/schemas/inventorySchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleValidationError, handleDatabaseError } from "@/lib/errorHandler";
import {
  validatePaginationParams,
  validateIntParam,
} from "@/lib/queryValidation";

/**
 * GET /api/inventory
 * Retrieves all inventory records with pagination and filtering
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Validate pagination parameters
    const paginationResult = validatePaginationParams(searchParams);
    if (!paginationResult.success) {
      return sendError(
        "Invalid pagination parameters",
        "INVALID_QUERY_PARAMS",
        400,
        paginationResult.errors
      );
    }
    const { page, limit, skip } = paginationResult.data!;

    // Validate organizationId filter
    const orgValidation = validateIntParam(
      searchParams.get("organizationId"),
      "organizationId"
    );
    if (!orgValidation.valid) {
      return sendError(orgValidation.error!, "INVALID_QUERY_PARAMS", 400);
    }
    const organizationId = orgValidation.value;

    const where = organizationId ? { organizationId } : undefined;

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
    return handleDatabaseError(error, "GET /api/inventory");
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
      return sendError("Organization not found", "ORG_NOT_FOUND", 404);
    }

    // Check if inventory item exists
    const item = await prisma.inventoryItem.findUnique({
      where: { id: validatedData.itemId },
    });
    if (!item) {
      return sendError("Inventory item not found", "ITEM_NOT_FOUND", 404);
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

    return sendSuccess(inventory, "Inventory updated successfully", 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error, "POST /api/inventory");
    }
    return handleDatabaseError(error, "POST /api/inventory");
  }
}
