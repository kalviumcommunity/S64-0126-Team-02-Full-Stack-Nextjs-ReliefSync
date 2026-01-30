import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AllocationStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/allocations/:id
 * Retrieves a specific allocation by ID
 */
export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const allocationId = parseInt(id, 10);

    if (isNaN(allocationId)) {
      return NextResponse.json(
        { error: "Invalid allocation ID" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Allocation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: allocation });
  } catch (error) {
    console.error("Error fetching allocation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
      return NextResponse.json(
        { error: "Invalid allocation ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { status, notes, approvedBy } = body;

    const existingAllocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
    });

    if (!existingAllocation) {
      return NextResponse.json(
        { error: "Allocation not found" },
        { status: 404 }
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
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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

    return NextResponse.json({
      message: "Allocation updated successfully",
      data: updatedAllocation,
    });
  } catch (error) {
    console.error("Error updating allocation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/allocations/:id
 * Deletes an allocation by ID
 */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const allocationId = parseInt(id, 10);

    if (isNaN(allocationId)) {
      return NextResponse.json(
        { error: "Invalid allocation ID" },
        { status: 400 }
      );
    }

    const existingAllocation = await prisma.allocation.findUnique({
      where: { id: allocationId },
    });

    if (!existingAllocation) {
      return NextResponse.json(
        { error: "Allocation not found" },
        { status: 404 }
      );
    }

    await prisma.allocation.delete({ where: { id: allocationId } });

    return NextResponse.json({
      message: "Allocation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting allocation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
