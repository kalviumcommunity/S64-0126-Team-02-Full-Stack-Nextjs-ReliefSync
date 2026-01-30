import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/inventory/:id
 * Retrieves a specific inventory record by ID
 */
export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        { error: "Invalid inventory ID" },
        { status: 400 }
      );
    }

    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
      include: {
        organization: true,
        item: true,
      },
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory record not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: inventory });
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/inventory/:id
 * Updates an inventory record by ID
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        { error: "Invalid inventory ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { quantity, minThreshold, maxCapacity } = body;

    const existingInventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!existingInventory) {
      return NextResponse.json(
        { error: "Inventory record not found" },
        { status: 404 }
      );
    }

    if (quantity !== undefined && quantity < 0) {
      return NextResponse.json(
        { error: "Quantity cannot be negative" },
        { status: 400 }
      );
    }

    const updatedInventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(minThreshold !== undefined && { minThreshold }),
        ...(maxCapacity !== undefined && { maxCapacity }),
        lastUpdated: new Date(),
      },
      include: {
        organization: { select: { id: true, name: true } },
        item: true,
      },
    });

    return NextResponse.json({
      message: "Inventory updated successfully",
      data: updatedInventory,
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/inventory/:id
 * Deletes an inventory record by ID
 */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const inventoryId = parseInt(id, 10);

    if (isNaN(inventoryId)) {
      return NextResponse.json(
        { error: "Invalid inventory ID" },
        { status: 400 }
      );
    }

    const existingInventory = await prisma.inventory.findUnique({
      where: { id: inventoryId },
    });

    if (!existingInventory) {
      return NextResponse.json(
        { error: "Inventory record not found" },
        { status: 404 }
      );
    }

    await prisma.inventory.delete({ where: { id: inventoryId } });

    return NextResponse.json({
      message: "Inventory record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
