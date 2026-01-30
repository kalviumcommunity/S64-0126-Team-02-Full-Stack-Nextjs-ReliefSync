import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

/**
 * GET /api/users
 * Retrieves all users with pagination support
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const role = searchParams.get("role");
    const skip = (page - 1) * limit;

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
      prisma.user.count(where ? { where } : {}),
    ]);

    return sendSuccess(users, "Users retrieved successfully", 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(
      "Failed to retrieve users",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}

/**
 * POST /api/users
 * Creates a new user
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, passwordHash, role, organizationId } = body;

    if (!email || !name || !passwordHash || !role) {
      return sendError(
        "Missing required fields: email, name, passwordHash, role",
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        400
      );
    }

    if (!["NGO", "GOVERNMENT"].includes(role)) {
      return sendError(
        "Invalid role. Must be NGO or GOVERNMENT",
        ERROR_CODES.INVALID_INPUT,
        400
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return sendError(
        "User with this email already exists",
        ERROR_CODES.DUPLICATE_ENTRY,
        400
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role,
        organizationId: organizationId || null,
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

    return sendSuccess(user, "User created successfully", 201);
  } catch (error) {
    return sendError(
      "Failed to create user",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}
