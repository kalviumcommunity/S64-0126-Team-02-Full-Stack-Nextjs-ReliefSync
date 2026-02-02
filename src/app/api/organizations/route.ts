import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { createOrganizationSchema } from "@/lib/schemas/organizationSchema";
import { createSuccessResponse, createErrorResponse } from "@/lib/validation";
import { sendSuccess } from "@/lib/responseHandler";
import { handleValidationError, handleDatabaseError } from "@/lib/errorHandler";

/**
 * GET /api/organizations
 * Retrieves all organizations with pagination support
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const isActive = searchParams.get("isActive");
    const skip = (page - 1) * limit;

    // Create cache key based on query parameters
    const cacheKey = `organizations:list:${page}:${limit}:${isActive || "all"}`;

    // Check Redis cache first (Cache-Aside Pattern)
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache Hit: ${cacheKey}`);
      return sendSuccess(
        JSON.parse(cachedData),
        "Organizations retrieved successfully (from cache)",
        200
      );
    }

    console.log(`⚠️ Cache Miss: ${cacheKey} - Fetching from database`);

    const where =
      isActive !== null ? { isActive: isActive === "true" } : undefined;

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        ...(where && { where }),
        select: {
          id: true,
          name: true,
          registrationNo: true,
          contactEmail: true,
          contactPhone: true,
          city: true,
          state: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { users: true, inventories: true },
          },
        },
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.organization.count(where ? { where } : undefined),
    ]);

    const responseData = organizations;
    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };

    // Cache the response for 5 minutes (300 seconds)
    await redis.setex(
      cacheKey,
      300,
      JSON.stringify({ data: responseData, pagination })
    );

    return sendSuccess(
      responseData,
      "Organizations retrieved successfully",
      200,
      pagination
    );
  } catch (error) {
    return handleDatabaseError(error, "GET /api/organizations");
  }
}

/**
 * POST /api/organizations
 * Creates a new organization with Zod validation
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = createOrganizationSchema.parse(body);

    // Check if organization already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { registrationNo: validatedData.registrationNo },
    });
    if (existingOrg) {
      return createErrorResponse(
        "Organization with this registration number already exists",
        400
      );
    }

    // Create new organization
    const organization = await prisma.organization.create({
      data: validatedData,
    });

    // Invalidate cache after creating new organization
    const keys = await redis.keys("organizations:list:*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `🗑️ Cache Invalidated: Cleared ${keys.length} organization list caches`
      );
    }

    return createSuccessResponse(
      "Organization created successfully",
      organization,
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error, "POST /api/organizations");
    }
    return handleDatabaseError(error, "POST /api/organizations");
  }
}
