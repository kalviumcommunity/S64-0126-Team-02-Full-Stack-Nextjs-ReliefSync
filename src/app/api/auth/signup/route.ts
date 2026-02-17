import { ZodError } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/schemas/authSchema";
import { generateToken } from "@/lib/auth";
import { getClientIdentifier, rateLimit } from "@/lib/rateLimit";
import { createValidationErrorResponse } from "@/lib/validation";
import { sendSuccess, sendError } from "@/lib/responseHandler";

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

    const clientId = getClientIdentifier(req);
    const rateKey = `auth:signup:${clientId}`;
    const limit = rateLimit(rateKey, {
      windowMs: Number(process.env.AUTH_SIGNUP_WINDOW_MS) || 60 * 60 * 1000,
      max: Number(process.env.AUTH_SIGNUP_MAX_ATTEMPTS) || 5,
    });

    if (!limit.allowed) {
      const response = sendError(
        "Too many signup attempts. Please try again later.",
        "RATE_LIMITED",
        429
      );
      response.headers.set(
        "Retry-After",
        Math.ceil((limit.resetAt - Date.now()) / 1000).toString()
      );
      return response;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return sendError(
        "User with this email already exists",
        "DUPLICATE_EMAIL",
        400
      );
    }

    // Validate organizationId if provided
    if (validatedData.organizationId) {
      const organization = await prisma.organization.findUnique({
        where: { id: validatedData.organizationId },
      });

      if (!organization) {
        return sendError("Organization not found", "ORG_NOT_FOUND", 400);
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
      organizationId: newUser.organizationId,
    });

    const response = sendSuccess(
      {
        user: newUser,
        token,
        expiresIn: "1h",
      },
      "Signup successful",
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
    return sendError("Signup failed. Please try again.", "INTERNAL_ERROR", 500);
  }
}
