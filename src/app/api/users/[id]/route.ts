<<<<<<< HEAD
import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
=======
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/schemas/userSchema";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/validation";
>>>>>>> 14c4207 (zod implementation)

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
<<<<<<< HEAD
      return sendError("Invalid user ID", ERROR_CODES.INVALID_ID, 400);
=======
      return createErrorResponse("Invalid user ID", 400);
>>>>>>> 14c4207 (zod implementation)
    }

    const body = await req.json();

    // Validate request body with Zod
    const validatedData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
<<<<<<< HEAD
      return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
    }

    if (role && !["NGO", "GOVERNMENT"].includes(role)) {
      return sendError(
        "Invalid role. Must be NGO or GOVERNMENT",
        ERROR_CODES.INVALID_INPUT,
        400
      );
=======
      return createErrorResponse("User not found", 404);
>>>>>>> 14c4207 (zod implementation)
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

<<<<<<< HEAD
    return sendSuccess(updatedUser, "User updated successfully");
  } catch (error) {
    return sendError(
      "Failed to update user",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
=======
    return createSuccessResponse("User updated successfully", updatedUser);
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error updating user:", error);
    return createErrorResponse("Internal server error", 500);
>>>>>>> 14c4207 (zod implementation)
  }
}

/**
 * DELETE /api/users/:id
 * Deletes a user by ID
 */
export async function DELETE(req: Request, { params }: Params) {
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
