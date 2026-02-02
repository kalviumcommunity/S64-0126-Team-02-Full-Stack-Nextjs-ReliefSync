import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { updateAllocationSchema } from "@/lib/schemas/allocationSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { createValidationErrorResponse } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/allocations/:id
 * Retrieves a specific allocation by ID
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const allocationId = parseInt(id, 10);

    if (isNaN(allocationId)) {
      return sendError("Invalid allocation ID", ERROR_CODES.INVALID_ID, 400);
    }

    // Create cache key for specific allocation
    const cacheKey = `allocation:${allocationId}`;

    // Check Redis cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache Hit: ${cacheKey}`);
      return sendSuccess(
        JSON.parse(cachedData),
        "Allocation retrieved successfully (from cache)"
      );
    }

    console.log(`⚠️ Cache Miss: ${cacheKey} - Fetching from database`);

    const allocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
      include: {
        fromOrg: true,
        toOrg: true,
        approver: { select: { id: true, name: true, email: true } },
      },
    });

    if (!allocation) {
      return sendError(
        "Allocation not found",
        ERROR_CODES.ALLOCATION_NOT_FOUND,
        404
      );
    }

    // Cache allocation data for 5 minutes (300 seconds)
    await redis.setex(cacheKey, 300, JSON.stringify(allocation));

    return sendSuccess(allocation, "Allocation retrieved successfully");
  } catch (error) {
    return sendError(
      "Failed to fetch allocation",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}

/**
 * PUT /api/allocations/:id
 * Updates an allocation (status, notes, approver) with Zod validation
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const allocationId = parseInt(id, 10);

    if (isNaN(allocationId)) {
      return sendError("Invalid allocation ID", ERROR_CODES.INVALID_ID, 400);
    }

    const body = await req.json();

    // Validate request body with Zod
    const validatedData = updateAllocationSchema.parse(body);

    // Check if allocation exists
    const existingAllocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
    });

    if (!existingAllocation) {
      return sendError(
        "Allocation not found",
        ERROR_CODES.ALLOCATION_NOT_FOUND,
        404
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.notes !== undefined)
      updateData.notes = validatedData.notes;
    if (validatedData.approvedBy) {
      updateData.approvedBy = validatedData.approvedBy;
      updateData.approvedDate = validatedData.approvedDate
        ? new Date(validatedData.approvedDate)
        : new Date();
    }
    if (validatedData.status === "COMPLETED") {
      updateData.completedDate = validatedData.completedDate
        ? new Date(validatedData.completedDate)
        : new Date();
    }

    // Update allocation
    const updatedAllocation = await prisma.allocation.update({
      where: { id: allocationId },
      data: updateData,
      include: {
        fromOrg: { select: { id: true, name: true } },
        toOrg: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    // Invalidate caches after update
    await redis.del(`allocation:${allocationId}`); // Invalidate specific allocation cache
    const keys = await redis.keys("allocations:list:*"); // Invalidate all list caches
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    console.log(
      `🗑️ Cache Invalidated: allocation:${allocationId} and allocations:list:* patterns`
    );

    return sendSuccess(updatedAllocation, "Allocation updated successfully");
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error updating allocation:", error);
    return sendError(
      "Failed to update allocation",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}

/**
 * DELETE /api/allocations/:id
 * Deletes an allocation by ID
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const allocationId = parseInt(id, 10);

    if (isNaN(allocationId)) {
      return sendError("Invalid allocation ID", ERROR_CODES.INVALID_ID, 400);
    }

    const existingAllocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
    });

    if (!existingAllocation) {
      return sendError(
        "Allocation not found",
        ERROR_CODES.ALLOCATION_NOT_FOUND,
        404
      );
    }

    await prisma.allocation.delete({ where: { id: allocationId } });

    // Invalidate caches after deletion
    await redis.del(`allocation:${allocationId}`); // Invalidate specific allocation cache
    const keys = await redis.keys("allocations:list:*"); // Invalidate all list caches
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    console.log(
      `🗑️ Cache Invalidated: allocation:${allocationId} and allocations:list:* patterns`
    );

    return sendSuccess({ id: allocationId }, "Allocation deleted successfully");
  } catch (error) {
    return sendError(
      "Failed to delete allocation",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}
