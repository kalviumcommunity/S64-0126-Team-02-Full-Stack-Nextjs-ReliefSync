import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/schemas/userSchema";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/validation";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import { authenticateRequest } from "@/lib/auth";

/**
 * GET /api/users
 * Retrieves all users with pagination support
 * 
 * PROTECTED ROUTE - Requires valid JWT token in Authorization header
 * Header: Authorization: Bearer <token>
 */
export async function GET(req: Request) {
  try {
    // Authenticate request
    const auth = authenticateRequest(req);
    if (!auth.isAuthenticated || auth.error) {
      return auth.error!;
    }

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
      prisma.user.count(where ? { where } : undefined),
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
 * Creates a new user with Zod validation
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = createUserSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return createErrorResponse(
        "User with this email already exists",
        400
      );
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

    return createSuccessResponse("User created successfully", user, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error creating user:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
