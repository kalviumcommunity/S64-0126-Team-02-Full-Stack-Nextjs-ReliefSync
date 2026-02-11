import { NextResponse } from "next/server";
import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/schemas/authSchema";
import { generateToken } from "@/lib/auth";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/validation";

/**
 * POST /api/auth/signup
 * Registers a new user with secure password hashing
 *
 * Request Body:
 * - name: string (required) - User's full name
 * - email: string (required) - User's email address
 * - password: string (required) - Plain text password (will be hashed)
 * - role: "NGO" | "GOVERNMENT" (required) - User's role
 * - organizationId: number (optional) - Associated organization ID
 *
 * Response:
 * - 201: User created successfully
 * - 400: Validation error or user already exists
 * - 500: Internal server error
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = signupSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Validate organizationId if provided
    if (validatedData.organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: validatedData.organizationId },
      });

      if (!organization) {
        return NextResponse.json(
          {
            success: false,
            message: "Organization not found",
          },
          { status: 400 }
        );
      }
    }

    // Hash the password with bcrypt
    // Salt rounds = 10 (higher = more secure but slower)
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      validatedData.password,
      saltRounds
    );

    // Create new user with hashed password
    const newUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        passwordHash: hashedPassword,
        role: validatedData.role,
        organizationId: validatedData.organizationId || null,
      },
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
    });

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = createSuccessResponse(
      "Signup successful",
      {
        user: newUser,
        token,
        expiresIn: "1h",
      },
      201
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
    console.error("Signup error:", error);
    return createErrorResponse("Signup failed. Please try again.", 500);
  }
}
