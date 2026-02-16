import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import redis, { invalidateTrackedKeys } from "@/lib/redis";
import { updateUserSchema } from "@/lib/schemas/userSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { createValidationErrorResponse } from "@/lib/validation";
import { getAuthUser, canModifyUser } from "@/lib/authorization";

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/users/:id
 * Retrieves a specific user by ID
 */
export async function GET(req: Request, { params }: Params) {
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

    // Check authorization - NGO users can only view users from their organization
    const authUser = getAuthUser(req);
    if (!canModifyUser(authUser, userId, user.organizationId)) {
      return sendError(
        "You do not have permission to view this user",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
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

    // Check authorization
    const authUser = getAuthUser(req);
    if (!canModifyUser(authUser, userId, existingUser.organizationId)) {
      return sendError(
        "You do not have permission to update this user",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    // Prevent NGO users from changing organizationId to other organizations
    if (validatedData.organizationId && authUser && authUser.role === "NGO") {
      if (validatedData.organizationId !== authUser.organizationId) {
        return sendError(
          "NGO users cannot transfer users to other organizations",
          "INSUFFICIENT_PERMISSIONS",
          403
        );
      }
    }

    // Check for duplicate email if email is being updated
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });
      if (existingEmail) {
        return sendError(
          "Email already in use by another user",
          ERROR_CODES.DUPLICATE_ENTRY,
          409
        );
      }
    }

    // Hash password if it's being updated
    const updateData: Record<string, unknown> = { ...validatedData };
    if (validatedData.password) {
      const saltRounds = 10;
      updateData.passwordHash = await bcrypt.hash(
        validatedData.password,
        saltRounds
      );
      delete updateData.password; // Remove plain password from update data
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
    await invalidateTrackedKeys("cache:users:list"); // Invalidate all list caches
    console.log(
      `🗑️ Cache Invalidated: user:${userId} and all tracked user list caches`
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

    // Check authorization
    const authUser = getAuthUser(_req);
    if (!canModifyUser(authUser, userId, existingUser.organizationId)) {
      return sendError(
        "You do not have permission to delete this user",
        "INSUFFICIENT_PERMISSIONS",
        403
      );
    }

    // Prevent users from deleting themselves
    if (authUser && authUser.id === userId) {
      return sendError(
        "You cannot delete your own account",
        "INVALID_OPERATION",
        400
      );
    }

    await prisma.user.delete({ where: { id: userId } });

    // Invalidate caches after deletion
    await redis.del(`user:${userId}`); // Invalidate specific user cache
    await invalidateTrackedKeys("cache:users:list"); // Invalidate all list caches
    console.log(
      `🗑️ Cache Invalidated: user:${userId} and all tracked user list caches`
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
