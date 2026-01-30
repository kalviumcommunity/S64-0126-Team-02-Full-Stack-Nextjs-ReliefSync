import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      prisma.inventory.count(where ? { where } : {}),
    ]);

    return NextResponse.json({
      data: inventories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
      return NextResponse.json(
        { error: "Missing required fields: organizationId, itemId, quantity" },
        { status: 400 }
      );
    }

    if (quantity < 0) {
      return NextResponse.json(
        { error: "Quantity cannot be negative" },
        { status: 400 }
      );
    }

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const item = await prisma.inventoryItem.findUnique({
      where: { id: itemId },
    });
    if (!item) {
      return NextResponse.json(
        { error: "Inventory item not found" },
        { status: 404 }
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

    return NextResponse.json(
      { message: "Inventory updated successfully", data: inventory },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating/updating inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
