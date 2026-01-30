import { prisma } from "@/lib/prisma";
import { AllocationStatus } from "@prisma/client";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

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
 * Updates an allocation (status, notes, approver)
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const allocationId = parseInt(id, 10);

    if (isNaN(allocationId)) {
      return sendError("Invalid allocation ID", ERROR_CODES.INVALID_ID, 400);
    }

    const body = await req.json();
    const { status, notes, approvedBy } = body;

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
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (approvedBy) {
      updateData.approvedBy = approvedBy;
      updateData.approvedDate = new Date();
    }
    if (status === "COMPLETED") {
      updateData.completedDate = new Date();
    }

    const updatedAllocation = await prisma.allocation.update({
      where: { id: allocationId },
      data: updateData,
      include: {
        fromOrg: { select: { id: true, name: true } },
        toOrg: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true } },
      },
    });

    return sendSuccess(updatedAllocation, "Allocation updated successfully");
  } catch (error) {
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
