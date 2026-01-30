import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

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
 * Updates a user by ID
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const userId = parseInt(id, 10);

    if (isNaN(userId)) {
      return sendError("Invalid user ID", ERROR_CODES.INVALID_ID, 400);
    }

    const body = await req.json();
    const { name, role, organizationId } = body;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return sendError("User not found", ERROR_CODES.USER_NOT_FOUND, 404);
    }

    if (role && !["NGO", "GOVERNMENT"].includes(role)) {
      return sendError(
        "Invalid role. Must be NGO or GOVERNMENT",
        ERROR_CODES.INVALID_INPUT,
        400
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(role && { role }),
        ...(organizationId !== undefined && { organizationId }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        organizationId: true,
        updatedAt: true,
      },
    });

    return sendSuccess(updatedUser, "User updated successfully");
  } catch (error) {
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
