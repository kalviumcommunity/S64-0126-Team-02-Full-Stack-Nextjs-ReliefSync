import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { createInventoryItemSchema } from "@/lib/schemas/inventoryItemSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleValidationError, handleDatabaseError } from "@/lib/errorHandler";
import {
  validatePaginationParams,
  validateEnumParam,
  validateSearchParam,
} from "@/lib/queryValidation";

/**
 * GET /api/inventory-items
 * Retrieves all inventory items (master catalog) with pagination and filtering
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

    // Validate category filter
    const categoryValidation = validateEnumParam(
      searchParams.get("category"),
      [
        "FOOD",
        "MEDICINE",
        "WATER",
        "SHELTER",
        "CLOTHING",
        "HYGIENE",
        "TOOLS",
        "OTHER",
      ] as const,
      "category"
    );
    if (!categoryValidation.valid) {
      return sendError(categoryValidation.error!, "INVALID_QUERY_PARAMS", 400);
    }
    const category = categoryValidation.value;

    // Validate unit filter
    const unitValidation = validateEnumParam(
      searchParams.get("unit"),
      ["KG", "LITER", "UNIT", "BOX", "PACKET"] as const,
      "unit"
    );
    if (!unitValidation.valid) {
      return sendError(unitValidation.error!, "INVALID_QUERY_PARAMS", 400);
    }
    const unit = unitValidation.value;

    // Validate search parameter
    const searchValidation = validateSearchParam(searchParams.get("search"));
    if (!searchValidation.valid) {
      return sendError(searchValidation.error!, "INVALID_QUERY_PARAMS", 400);
    }
    const search = searchValidation.value;

    const where: Record<string, unknown> = {};

    if (category) where.category = category;
    if (unit) where.unit = unit;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const whereClause = Object.keys(where).length > 0 ? where : undefined;

    const [items, total] = await Promise.all([
      prisma.inventoryItem.findMany({
        ...(whereClause && { where: whereClause }),
        skip,
        take: limit,
        orderBy: [{ category: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: { inventories: true },
          },
        },
      }),
      prisma.inventoryItem.count(
        whereClause ? { where: whereClause } : undefined
      ),
    ]);

    return sendSuccess(items, "Inventory items retrieved successfully", 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleDatabaseError(error, "GET /api/inventory-items");
  }
}

/**
 * POST /api/inventory-items
 * Creates a new inventory item in the master catalog
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = createInventoryItemSchema.parse(body);

    // Check if item with same name and category already exists
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        name: {
          equals: validatedData.name,
          mode: "insensitive",
        },
        category: validatedData.category,
      },
    });

    if (existingItem) {
      return sendError(
        `Item "${validatedData.name}" already exists in category ${validatedData.category}`,
        "DUPLICATE_ITEM",
        400
      );
    }

    // Create new inventory item
    const item = await prisma.inventoryItem.create({
      data: validatedData,
      include: {
        _count: {
          select: { inventories: true },
        },
      },
    });

    return sendSuccess(item, "Inventory item created successfully", 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error, "POST /api/inventory-items");
    }
    return handleDatabaseError(error, "POST /api/inventory-items");
  }
}
