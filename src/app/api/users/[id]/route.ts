import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { updateUserSchema } from "@/lib/schemas/userSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { createValidationErrorResponse } from "@/lib/validation";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/users/:id
 * Retrieves a specific user by ID
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return sendError("Invalid user ID", ERROR_CODES.INVALID_ID, 400);
    }

    // Create cache key for specific user
    const cacheKey = `user:${userId}`;

    // Check Redis cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`✅ Cache Hit: ${cacheKey}`);
      return sendSuccess(
        JSON.parse(cachedData),
        "User retrieved successfully (from cache)"
      );
    }

    console.log(`⚠️ Cache Miss: ${cacheKey} - Fetching from database`);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        organization: {
          select: { id: true, name: true, registrationNo: true },
        },
        allocationsCreated: {
          select: { id: true, status: true, requestDate: true },
          take: 5,
          orderBy: { requestDate: "desc" },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Cache user data for 10 minutes (600 seconds)
    await redis.setex(cacheKey, 600, JSON.stringify(user));

    return sendSuccess(user, "User retrieved successfully");
  } catch (error) {
    return sendError(
      "Failed to retrieve user",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}

/**
 * PUT /api/users/:id
 * Updates a user by ID with Zod validation
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return sendError("Invalid user ID", ERROR_CODES.INVALID_ID, 400);
    }

    const body = await req.json();

    // Validate request body with Zod
    const validatedData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        updatedAt: true,
      },
    });

    // Invalidate caches after update
    await redis.del(`user:${userId}`); // Invalidate specific user cache
    const keys = await redis.keys("users:list:*"); // Invalidate all list caches
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    console.log(
      `🗑️ Cache Invalidated: user:${userId} and users:list:* patterns`
    );

    return sendSuccess(updatedUser, "User updated successfully");
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error updating user:", error);
    return sendError(
      "Failed to update user",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}

/**
 * DELETE /api/users/:id
 * Deletes a user by ID
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return sendError("Invalid user ID", ERROR_CODES.INVALID_ID, 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
    }

    await prisma.user.delete({ where: { id: userId } });

    // Invalidate caches after deletion
    await redis.del(`user:${userId}`); // Invalidate specific user cache
    const keys = await redis.keys("users:list:*"); // Invalidate all list caches
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    console.log(
      `🗑️ Cache Invalidated: user:${userId} and users:list:* patterns`
    );

    return sendSuccess(null, "User deleted successfully");
  } catch (error) {
    return sendError(
      "Failed to delete user",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}
