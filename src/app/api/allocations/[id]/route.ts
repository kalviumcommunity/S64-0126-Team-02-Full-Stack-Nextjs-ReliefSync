import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import redis, { invalidateTrackedKeys } from "@/lib/redis";
import { updateAllocationSchema } from "@/lib/schemas/allocationSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { createValidationErrorResponse } from "@/lib/validation";
import {
  getAuthUser,
  isValidStatusTransition,
  canTransitionAllocationStatus,
} from "@/lib/authorization";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/allocations/:id
 * Retrieves a specific allocation by ID
 */
export async function GET(req: Request, { params }: Params) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

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
      const allocation = JSON.parse(cachedData);

      // Authorization: NGO users can only view allocations involving their organization
      if (
        authUser.role === "NGO" &&
        authUser.organizationId !== allocation.fromOrgId &&
        authUser.organizationId !== allocation.toOrgId
      ) {
        return sendError(
          "Access denied: You can only view allocations involving your organization",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }

      return sendSuccess(
        allocation,
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

    // Authorization: NGO users can only view allocations involving their organization
    if (
      authUser.role === "NGO" &&
      authUser.organizationId !== allocation.fromOrgId &&
      authUser.organizationId !== allocation.toOrgId
    ) {
      return sendError(
        "Access denied: You can only view allocations involving your organization",
        ERROR_CODES.FORBIDDEN,
        403
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
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

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

    // Authorization: NGO users can only modify allocations involving their organization
    if (
      authUser.role === "NGO" &&
      authUser.organizationId !== existingAllocation.fromOrgId &&
      authUser.organizationId !== existingAllocation.toOrgId
    ) {
      return sendError(
        "Access denied: You can only modify allocations involving your organization",
        ERROR_CODES.FORBIDDEN,
        403
      );
    }

    // Workflow validation: If status is being updated, validate transition
    if (
      validatedData.status &&
      validatedData.status !== existingAllocation.status
    ) {
      // Check if the status transition is valid
      if (
        !isValidStatusTransition(
          existingAllocation.status,
          validatedData.status
        )
      ) {
        return sendError(
          `Invalid status transition from ${existingAllocation.status} to ${validatedData.status}`,
          ERROR_CODES.INVALID_STATUS_TRANSITION,
          400
        );
      }

      // Check if the user has permission to perform this transition
      const canTransition = canTransitionAllocationStatus(
        authUser,
        existingAllocation.status,
        validatedData.status,
        existingAllocation.fromOrgId
      );

      if (!canTransition.allowed) {
        return sendError(
          canTransition.reason ||
            `You do not have permission to transition this allocation from ${existingAllocation.status} to ${validatedData.status}`,
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
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
    await invalidateTrackedKeys("cache:allocations:list"); // Invalidate all list caches
    console.log(
      `🗑️ Cache Invalidated: allocation:${allocationId} and all tracked allocation list caches`
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
export async function DELETE(req: Request, { params }: Params) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
    }

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

    // Authorization: Check if user can delete this allocation
    if (authUser.role === "NGO") {
      // NGO users can only delete allocations from their organization
      if (authUser.organizationId !== existingAllocation.fromOrgId) {
        return sendError(
          "Access denied: You can only delete allocations from your organization",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }

      // NGO users can only delete allocations in PENDING or CANCELLED status
      if (!["PENDING", "CANCELLED"].includes(existingAllocation.status)) {
        return sendError(
          "Access denied: You can only delete allocations in PENDING or CANCELLED status",
          ERROR_CODES.FORBIDDEN,
          403
        );
      }
    }

    await prisma.allocation.delete({ where: { id: allocationId } });

    // Invalidate caches after deletion
    await redis.del(`allocation:${allocationId}`); // Invalidate specific allocation cache
    await invalidateTrackedKeys("cache:allocations:list"); // Invalidate all list caches
    console.log(
      `🗑️ Cache Invalidated: allocation:${allocationId} and all tracked allocation list caches`
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
