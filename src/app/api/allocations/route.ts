import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AllocationStatus } from "@prisma/client";

/**
 * GET /api/allocations
 * Retrieves all allocations with pagination and filtering
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status") as AllocationStatus | null;
    const toOrgId = searchParams.get("toOrgId");
    const fromOrgId = searchParams.get("fromOrgId");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (toOrgId) where.toOrgId = parseInt(toOrgId, 10);
    if (fromOrgId) where.fromOrgId = parseInt(fromOrgId, 10);

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
      prisma.allocation.count(whereClause ? { where: whereClause } : {}),
    ]);

    return NextResponse.json({
      data: allocations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching allocations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/allocations
 * Creates a new allocation request
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fromOrgId, toOrgId, itemId, quantity, requestedBy, notes } = body;

    if (!toOrgId || !itemId || !quantity || !requestedBy) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: toOrgId, itemId, quantity, requestedBy",
        },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { error: "Quantity must be greater than 0" },
        { status: 400 }
      );
    }

    const toOrg = await prisma.organization.findUnique({
      where: { id: toOrgId },
    });
    if (!toOrg) {
      return NextResponse.json(
        { error: "Recipient organization not found" },
        { status: 404 }
      );
    }

    if (fromOrgId) {
      const fromOrg = await prisma.organization.findUnique({
        where: { id: fromOrgId },
      });
      if (!fromOrg) {
        return NextResponse.json(
          { error: "Source organization not found" },
          { status: 404 }
        );
      }
    }

    const allocation = await prisma.allocation.create({
      data: {
        fromOrgId: fromOrgId || null,
        toOrgId,
        itemId,
        quantity,
        requestedBy,
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        fromOrg: { select: { id: true, name: true } },
        toOrg: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      { message: "Allocation request created successfully", data: allocation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating allocation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
