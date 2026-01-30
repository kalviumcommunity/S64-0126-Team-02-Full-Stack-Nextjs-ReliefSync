import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { createOrganizationSchema } from "@/lib/schemas/organizationSchema";
import { createSuccessResponse, createErrorResponse } from "@/lib/validation";
import { sendSuccess } from "@/lib/responseHandler";
import { handleValidationError, handleDatabaseError } from "@/lib/errorHandler";

/**
 * GET /api/organizations
 * Retrieves all organizations with pagination support
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const isActive = searchParams.get("isActive");
    const skip = (page - 1) * limit;

    const where =
      isActive !== null ? { isActive: isActive === "true" } : undefined;

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        ...(where && { where }),
        select: {
          id: true,
          name: true,
          registrationNo: true,
          contactEmail: true,
          contactPhone: true,
          city: true,
          state: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: { users: true, inventories: true },
          },
        },
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
      prisma.organization.count(where ? { where } : undefined),
    ]);

    return sendSuccess(
      organizations,
      "Organizations retrieved successfully",
      200,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    return handleDatabaseError(error, "GET /api/organizations");
  }
}

/**
 * POST /api/organizations
 * Creates a new organization with Zod validation
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = createOrganizationSchema.parse(body);

    // Check if organization already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { registrationNo: validatedData.registrationNo },
    });
    if (existingOrg) {
      return createErrorResponse(
        "Organization with this registration number already exists",
        400
      );
    }

    // Create new organization
    const organization = await prisma.organization.create({
      data: validatedData,
    });

    return createSuccessResponse(
      "Organization created successfully",
      organization,
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error, "POST /api/organizations");
    }
    return handleDatabaseError(error, "POST /api/organizations");
  }
}
