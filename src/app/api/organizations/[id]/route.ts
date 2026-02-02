import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { updateOrganizationSchema } from "@/lib/schemas/organizationSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { createValidationErrorResponse } from "@/lib/validation";

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
    const { id } = await params;
    const orgId = parseInt(id, 10);

    if (isNaN(orgId)) {
      return sendError("Invalid organization ID", ERROR_CODES.INVALID_ID, 400);
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

    // Update organization
    const updatedOrg = await prisma.organization.update({
      where: { id: orgId },
      data: validatedData,
    });

    // Invalidate caches after update
    await redis.del(`organization:${orgId}`); // Invalidate specific organization cache
    const keys = await redis.keys("organizations:list:*"); // Invalidate all list caches
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    console.log(
      `🗑️ Cache Invalidated: organization:${orgId} and organizations:list:* patterns`
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

    // Invalidate caches after deletion
    await redis.del(`organization:${orgId}`); // Invalidate specific organization cache
    const keys = await redis.keys("organizations:list:*"); // Invalidate all list caches
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    console.log(
      `🗑️ Cache Invalidated: organization:${orgId} and organizations:list:* patterns`
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
