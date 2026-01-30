<<<<<<< HEAD
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
=======
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateOrganizationSchema } from "@/lib/schemas/organizationSchema";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/validation";
>>>>>>> 14c4207 (zod implementation)

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
 * Updates an organization by ID with Zod validation
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
<<<<<<< HEAD
      return sendError("Invalid organization ID", ERROR_CODES.INVALID_ID, 400);
=======
      return createErrorResponse("Invalid organization ID", 400);
>>>>>>> 14c4207 (zod implementation)
    }

    const body = await req.json();

    // Validate request body with Zod
    const validatedData = updateOrganizationSchema.parse(body);

    // Check if organization exists
    const existingOrg = await prisma.organization.findUnique({
      where: { id: orgId },
    });

    if (!existingOrg) {
<<<<<<< HEAD
      return sendError(
        "Organization not found",
        ERROR_CODES.ORGANIZATION_NOT_FOUND,
        404
      );
=======
      return createErrorResponse("Organization not found", 404);
>>>>>>> 14c4207 (zod implementation)
    }

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: validatedData,
    });

<<<<<<< HEAD
    return sendSuccess(updatedOrg, "Organization updated successfully");
  } catch (error) {
    return sendError(
      "Failed to update organization",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
=======
    return createSuccessResponse(
      "Organization updated successfully",
      updatedOrg
>>>>>>> 14c4207 (zod implementation)
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error updating organization:", error);
    return createErrorResponse("Internal server error", 500);
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
