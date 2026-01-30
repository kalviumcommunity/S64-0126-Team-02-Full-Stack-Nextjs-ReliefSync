import { NextResponse } from "next/server";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas/authSchema";
import { generateToken } from "@/lib/auth";
import { createValidationErrorResponse, createErrorResponse } from "@/lib/validation";

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
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
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

    return NextResponse.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
        expiresIn: "1h",
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Login error:", error);
    return createErrorResponse("Login failed. Please try again.", 500);
  }
}
