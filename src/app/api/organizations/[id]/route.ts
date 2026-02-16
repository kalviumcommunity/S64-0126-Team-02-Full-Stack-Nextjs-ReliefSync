import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import redis, { invalidateTrackedKeys } from "@/lib/redis";
import { updateOrganizationSchema } from "@/lib/schemas/organizationSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { createValidationErrorResponse } from "@/lib/validation";
import {
  getAuthUser,
  canModifyOrgResource,
  isGovernment,
} from "@/lib/authorization";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/organizations/:id
 * Retrieves a specific organization by ID
 */
export async function GET(req: Request, { params }: Params) {
  try {
    const authUser = getAuthUser(req);
    const { id } = await params;
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return sendError("Invalid organization ID", ERROR_CODES.INVALID_ID, 400);
    }

    // Authorization: NGO users can only view their own organization
    if (!canModifyOrgResource(authUser, orgId)) {
      return sendError(
        "Access denied: You can only view your own organization",
        ERROR_CODES.FORBIDDEN,
        403
      );
    }

    // Create cache key for specific organization
    const cacheKey = `organization:${orgId}`;

    // Check Redis cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache Hit: ${cacheKey}`);
      return sendSuccess(
        JSON.parse(cachedData),
        "Organization retrieved successfully (from cache)"
      );
    }

    console.log(`⚠️ Cache Miss: ${cacheKey} - Fetching from database`);

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

    // Cache organization data for 10 minutes (600 seconds)
    await redis.setex(cacheKey, 600, JSON.stringify(organization));

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
    const authUser = getAuthUser(req);
    const { id } = await params;
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return sendError("Invalid organization ID", ERROR_CODES.INVALID_ID, 400);
    }

    // Authorization: NGO users can only modify their own organization
    if (!canModifyOrgResource(authUser, orgId)) {
      return sendError(
        "Access denied: You can only modify your own organization",
        ERROR_CODES.FORBIDDEN,
        403
      );
    }

    const body = await req.json();

    // Validate request body with Zod
    const validatedData = updateOrganizationSchema.parse(body);

    // Check if organization exists
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

    // Check for duplicate registration number if it's being updated
    if (
      validatedData.registrationNo &&
      validatedData.registrationNo !== existingOrg.registrationNo
    ) {
      const existingReg = await prisma.organization.findUnique({
        where: { registrationNo: validatedData.registrationNo },
      });
      if (existingReg) {
        return sendError(
          "Registration number already in use by another organization",
          ERROR_CODES.DUPLICATE_ENTRY,
          409
        );
      }
    }

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: validatedData,
    });

    // Invalidate caches after update
    await redis.del(`organization:${orgId}`); // Invalidate specific organization cache
    await invalidateTrackedKeys("cache:organizations:list"); // Invalidate all list caches
    console.log(
      `🗑️ Cache Invalidated: organization:${orgId} and all tracked org list caches`
    );

    return sendSuccess(updatedOrg, "Organization updated successfully");
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error updating organization:", error);
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
export async function DELETE(req: Request, { params }: Params) {
  try {
    const authUser = getAuthUser(req);
    const { id } = await params;
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return sendError("Invalid organization ID", ERROR_CODES.INVALID_ID, 400);
    }

    // Authorization: Only GOVERNMENT users can delete organizations
    if (!isGovernment(authUser)) {
      return sendError(
        "Access denied: Only government users can delete organizations",
        ERROR_CODES.FORBIDDEN,
        403
      );
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

    // Invalidate caches after deletion
    await redis.del(`organization:${orgId}`); // Invalidate specific organization cache
    await invalidateTrackedKeys("cache:organizations:list"); // Invalidate all list caches
    console.log(
      `🗑️ Cache Invalidated: organization:${orgId} and all tracked org list caches`
    );

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
