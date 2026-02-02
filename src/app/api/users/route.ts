import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { createUserSchema } from "@/lib/schemas/userSchema";
import { createSuccessResponse, createErrorResponse } from "@/lib/validation";
import { sendSuccess } from "@/lib/responseHandler";
import { handleValidationError, handleDatabaseError } from "@/lib/errorHandler";

/**
 * GET /api/users
 * Retrieves all users with pagination support
 *
 * PROTECTED ROUTE - Requires valid JWT token in Authorization header
 * All authenticated users (both NGO and GOVERNMENT roles) can access this endpoint.
 *
 * Middleware Validation:
 * - Validates JWT token from Authorization header
 * - Passes user info via x-user-id, x-user-email, x-user-role headers
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - role: Filter by role (NGO or GOVERNMENT, optional)
 */
export async function GET(req: NextRequest) {
  try {
    // User info is validated and passed by middleware
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const role = searchParams.get("role");
    const skip = (page - 1) * limit;

    // Create cache key based on query parameters
    const cacheKey = `users:list:${page}:${limit}:${role || "all"}`;

    // Check Redis cache first (Cache-Aside Pattern)
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache Hit: ${cacheKey}`);
      return sendSuccess(
        JSON.parse(cachedData),
        "Users retrieved successfully (from cache)",
        200
      );
    }

    console.log(`⚠️ Cache Miss: ${cacheKey} - Fetching from database`);

    const where = role ? { role: role as "NGO" | "GOVERNMENT" } : undefined;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        ...(where && { where }),
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          organizationId: true,
          organization: {
            select: { id: true, name: true },
          },
          createdAt: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count(where ? { where } : undefined),
    ]);

    const responseData = users;
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
      "Users retrieved successfully",
      200,
      pagination
    );
  } catch (error) {
    return handleDatabaseError(error, "GET /api/users");
  }
}

/**
 * POST /api/users
 * Creates a new user with Zod validation
 *
 * PROTECTED ROUTE - Requires valid JWT token
 * Both NGO and GOVERNMENT users can create new users (configurable as needed)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return createErrorResponse("User with this email already exists", 400);
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        passwordHash: validatedData.passwordHash,
        role: validatedData.role,
        organizationId: validatedData.organizationId || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        createdAt: true,
      },
    });

    // Invalidate cache after creating new user
    // Clear all user list caches to ensure fresh data
    const keys = await redis.keys("users:list:*");
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(
        `🗑️ Cache Invalidated: Cleared ${keys.length} user list caches`
      );
    }

    return createSuccessResponse("User created successfully", user, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error, "POST /api/users");
    }
    return handleDatabaseError(error, "POST /api/users");
  }
}
