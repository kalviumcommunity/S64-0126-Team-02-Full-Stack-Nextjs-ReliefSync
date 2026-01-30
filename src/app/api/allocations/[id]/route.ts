<<<<<<< HEAD
import { prisma } from "@/lib/prisma";
import { AllocationStatus } from "@prisma/client";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
=======
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateAllocationSchema } from "@/lib/schemas/allocationSchema";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/validation";
>>>>>>> 14c4207 (zod implementation)

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
<<<<<<< HEAD
      return sendError("Invalid allocation ID", ERROR_CODES.INVALID_ID, 400);
=======
      return createErrorResponse("Invalid allocation ID", 400);
>>>>>>> 14c4207 (zod implementation)
    }

    const body = await req.json();

    // Validate request body with Zod
    const validatedData = updateAllocationSchema.parse(body);

    // Check if allocation exists
    const existingAllocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
    });

    if (!existingAllocation) {
<<<<<<< HEAD
      return sendError(
        "Allocation not found",
        ERROR_CODES.ALLOCATION_NOT_FOUND,
        404
      );
    }

    const validStatuses: AllocationStatus[] = [
      "PENDING",
      "APPROVED",
      "IN_TRANSIT",
      "COMPLETED",
      "REJECTED",
      "CANCELLED",
    ];

    if (status && !validStatuses.includes(status)) {
      return sendError("Invalid status value", ERROR_CODES.INVALID_INPUT, 400);
=======
      return createErrorResponse("Allocation not found", 404);
>>>>>>> 14c4207 (zod implementation)
    }

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes;
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

<<<<<<< HEAD
    return sendSuccess(updatedAllocation, "Allocation updated successfully");
  } catch (error) {
    return sendError(
      "Failed to update allocation",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
=======
    return createSuccessResponse(
      "Allocation updated successfully",
      updatedAllocation
>>>>>>> 14c4207 (zod implementation)
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error updating allocation:", error);
    return createErrorResponse("Internal server error", 500);
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
