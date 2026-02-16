import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas/authSchema";
import { generateToken } from "@/lib/auth";
import { createValidationErrorResponse } from "@/lib/validation";
import { sendSuccess, sendError } from "@/lib/responseHandler";

/**
 * POST /api/auth/login
 * Authenticates a user and issues a JWT token
 *
 * Request Body:
 * - email: string (required) - User's email address
 * - password: string (required) - User's password
 *
 * Response:
 * - 200: Login successful with JWT token
 * - 400: Validation error
 * - 401: Invalid credentials
 * - 404: User not found
 * - 500: Internal server error
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        organizationId: true,
        organization: {
          select: { id: true, name: true },
        },
      },
    });

    // Check if user exists
    if (!user) {
      return sendError("User not found", "USER_NOT_FOUND", 404);
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return sendError("Invalid credentials", "INVALID_CREDENTIALS", 401);
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    // Return user data (without password) and token
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
      organization: user.organization,
    };

    const response = sendSuccess(
      {
        user: userResponse,
        token,
        expiresIn: "1h",
      },
      "Login successful",
      200
    );

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Login error:", error);
    return sendError("Login failed. Please try again.", "INTERNAL_ERROR", 500);
  }
}
