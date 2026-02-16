import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import redis, { trackCacheKey, invalidateTrackedKeys } from "@/lib/redis";
import { AllocationStatus } from "@prisma/client";
import { createAllocationSchema } from "@/lib/schemas/allocationSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { handleValidationError, handleDatabaseError } from "@/lib/errorHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import {
  validatePaginationParams,
  validateIntParam,
  validateEnumParam,
} from "@/lib/queryValidation";
import { getAuthUser } from "@/lib/authorization";

/**
 * GET /api/allocations
 * Retrieves all allocations with pagination and filtering
 */
export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }
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

    // Validate status filter
    const statusValidation = validateEnumParam(
      searchParams.get("status"),
      [
        "PENDING",
        "APPROVED",
        "IN_TRANSIT",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
      ] as const,
      "status"
    );
    if (!statusValidation.valid) {
      return sendError(statusValidation.error!, "INVALID_QUERY_PARAMS", 400);
    }
    const status = statusValidation.value as AllocationStatus | undefined;

    // Validate organization ID filters
    const toOrgValidation = validateIntParam(
      searchParams.get("toOrgId"),
      "toOrgId"
    );
    if (!toOrgValidation.valid) {
      return sendError(toOrgValidation.error!, "INVALID_QUERY_PARAMS", 400);
    }
    const toOrgId = toOrgValidation.value;

    const fromOrgValidation = validateIntParam(
      searchParams.get("fromOrgId"),
      "fromOrgId"
    );
    if (!fromOrgValidation.valid) {
      return sendError(fromOrgValidation.error!, "INVALID_QUERY_PARAMS", 400);
    }
    const fromOrgId = fromOrgValidation.value;

    // Create cache key based on query parameters and user organization for NGO users
    const orgScope = authUser.role === "NGO" ? authUser.organizationId : "all";
    const cacheKey = `allocations:list:${orgScope}:${page}:${limit}:${status || "all"}:${toOrgId || "all"}:${fromOrgId || "all"}`;

    // Check Redis cache first (Cache-Aside Pattern)
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache Hit: ${cacheKey}`);
      return sendSuccess(
        JSON.parse(cachedData),
        "Allocations retrieved successfully (from cache)",
        200
      );
    }

    console.log(`⚠️ Cache Miss: ${cacheKey} - Fetching from database`);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (toOrgId) where.toOrgId = toOrgId;
    if (fromOrgId) where.fromOrgId = fromOrgId;

    // Authorization: NGO users can only view allocations involving their organization
    if (authUser.role === "NGO" && authUser.organizationId) {
      where.OR = [
        { fromOrgId: authUser.organizationId },
        { toOrgId: authUser.organizationId },
      ];
    }

    const whereClause = Object.keys(where).length > 0 ? where : undefined;

    const [allocations, total] = await Promise.all([
      prisma.allocation.findMany({
        ...(whereClause && { where: whereClause }),
        include: {
          fromOrg: { select: { id: true, name: true } },
          toOrg: { select: { id: true, name: true } },
          approver: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { requestDate: "desc" },
      }),
      prisma.allocation.count(whereClause ? { where: whereClause } : undefined),
    ]);

    const responseData = allocations;
    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    // Cache the response for 3 minutes (180 seconds) - allocations change more frequently
    await redis.setex(
      cacheKey,
      180,
      JSON.stringify({ data: responseData, pagination })
    );
    await trackCacheKey("cache:allocations:list", cacheKey, 180);

    return sendSuccess(
      responseData,
      "Allocations retrieved successfully",
      200,
      pagination
    );
  } catch (error) {
    return handleDatabaseError(error, "GET /api/allocations");
  }
}

/**
 * POST /api/allocations
 * Creates a new allocation request with Zod validation
 */
export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = createAllocationSchema.parse(body);

    // Authorization: NGO users can only create allocations from their organization
    if (authUser.role === "NGO") {
      if (
        validatedData.fromOrgId &&
        validatedData.fromOrgId !== authUser.organizationId
      ) {
        return sendError(
          "Access denied: You can only create allocations from your organization",
          "FORBIDDEN",
          403
        );
      }
      // If fromOrgId not specified, default to user's organization for NGO users
      if (!validatedData.fromOrgId) {
        validatedData.fromOrgId = authUser.organizationId || null;
      }
    }

    // Check if recipient organization exists
    const toOrg = await prisma.organization.findUnique({
      where: { id: validatedData.toOrgId },
    });
    if (!toOrg) {
      return sendError(
        "Recipient organization not found",
        "ORG_NOT_FOUND",
        404
      );
    }

    // Check if source organization exists (if provided)
    if (validatedData.fromOrgId) {
      const fromOrg = await prisma.organization.findUnique({
        where: { id: validatedData.fromOrgId },
      });
      if (!fromOrg) {
        return sendError("Source organization not found", "ORG_NOT_FOUND", 404);
      }
    }

    // Check if inventory item exists
    const item = await prisma.inventoryItem.findUnique({
      where: { id: validatedData.itemId },
    });
    if (!item) {
      return sendError("Inventory item not found", "ITEM_NOT_FOUND", 404);
    }

    // Create allocation
    const allocation = await prisma.allocation.create({
      data: {
        fromOrgId: validatedData.fromOrgId || null,
        toOrgId: validatedData.toOrgId,
        itemId: validatedData.itemId,
        quantity: validatedData.quantity,
        requestedBy: validatedData.requestedBy,
        notes: validatedData.notes || null,
        status: "PENDING",
      },
      include: {
        fromOrg: { select: { id: true, name: true } },
        toOrg: { select: { id: true, name: true } },
      },
    });

    // Invalidate cache after creating new allocation
    const deleted = await invalidateTrackedKeys("cache:allocations:list");
    if (deleted > 0) {
      console.log(
        `🗑️ Cache Invalidated: Cleared ${deleted} allocation list caches`
      );
    }

    return sendSuccess(
      allocation,
      "Allocation request created successfully",
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error, "POST /api/allocations");
    }
    return handleDatabaseError(error, "POST /api/allocations");
  }
}
