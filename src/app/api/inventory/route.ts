import { prisma } from "@/lib/prisma";
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
 * Creates or updates an inventory record
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId, itemId, quantity, minThreshold, maxCapacity } =
      body;

    if (!organizationId || !itemId || quantity === undefined) {
      return sendError(
        "Missing required fields: organizationId, itemId, quantity",
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        400
      );
    }

    if (quantity < 0) {
      return sendError(
        "Quantity cannot be negative",
        ERROR_CODES.INVALID_INPUT,
        400
      );
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) {
      return sendError(
        "Organization not found",
        ERROR_CODES.ORGANIZATION_NOT_FOUND,
        404
      );
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      return sendError(
        "Inventory item not found",
        ERROR_CODES.ITEM_NOT_FOUND,
        404
      );
    }

    const inventory = await prisma.inventory.upsert({
      where: {
        organizationId_itemId: { organizationId, itemId },
      },
      update: {
        quantity,
        ...(minThreshold !== undefined && { minThreshold }),
        ...(maxCapacity !== undefined && { maxCapacity }),
        lastUpdated: new Date(),
      },
      create: {
        organizationId,
        itemId,
        quantity,
        minThreshold: minThreshold || 0,
        maxCapacity: maxCapacity || null,
      },
      include: {
        organization: { select: { id: true, name: true } },
        item: true,
      },
    });

    return sendSuccess(inventory, "Inventory updated successfully", 201);
  } catch (error) {
    return sendError(
      "Failed to create/update inventory",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}
