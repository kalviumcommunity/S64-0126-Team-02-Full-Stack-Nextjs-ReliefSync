import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/organizations/:id
 * Retrieves a specific organization by ID
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return sendError("Invalid organization ID", ERROR_CODES.INVALID_ID, 400);
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
      return sendError(
        "Organization not found",
        ERROR_CODES.ORGANIZATION_NOT_FOUND,
        404
      );
    }

    return sendSuccess(organization, "Organization retrieved successfully");
  } catch (error) {
    return sendError(
      "Failed to retrieve organization",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
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
      return sendError("Invalid organization ID", ERROR_CODES.INVALID_ID, 400);
    }

    const body = await req.json();
    const { name, contactEmail, contactPhone, address, city, state, isActive } =
      body;

    const existingOrg = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!existingOrg) {
      return sendError(
        "Organization not found",
        ERROR_CODES.ORGANIZATION_NOT_FOUND,
        404
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

    return sendSuccess(updatedOrg, "Organization updated successfully");
  } catch (error) {
    return sendError(
      "Failed to update organization",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}

/**
 * DELETE /api/organizations/:id
 * Deletes an organization by ID
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return sendError("Invalid organization ID", ERROR_CODES.INVALID_ID, 400);
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!existingOrg) {
      return sendError(
        "Organization not found",
        ERROR_CODES.ORGANIZATION_NOT_FOUND,
        404
      );
    }

    await prisma.organization.delete({ where: { id: orgId } });

    return sendSuccess(null, "Organization deleted successfully");
  } catch (error) {
    return sendError(
      "Failed to delete organization",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}
