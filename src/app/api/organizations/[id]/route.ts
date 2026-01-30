import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/organizations/:id
 * Retrieves a specific organization by ID
 */
export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return NextResponse.json(
        { error: "Invalid organization ID" },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        inventories: {
          include: { item: true },
          take: 10,
        },
        _count: {
          select: { allocationsFrom: true, allocationsTo: true },
        },
      },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: organization });
  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/:id
 * Updates an organization by ID
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return NextResponse.json(
        { error: "Invalid organization ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, contactEmail, contactPhone, address, city, state, isActive } =
      body;

    const existingOrg = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(name && { name }),
        ...(contactEmail && { contactEmail }),
        ...(contactPhone && { contactPhone }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      message: "Organization updated successfully",
      data: updatedOrg,
    });
  } catch (error) {
    console.error("Error updating organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/organizations/:id
 * Deletes an organization by ID
 */
export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return NextResponse.json(
        { error: "Invalid organization ID" },
        { status: 400 }
      );
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!existingOrg) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    await prisma.organization.delete({ where: { id: orgId } });

    return NextResponse.json({
      message: "Organization deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
