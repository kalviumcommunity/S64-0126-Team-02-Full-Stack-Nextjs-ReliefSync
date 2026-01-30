import { prisma } from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

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
    return sendError(
      "Failed to retrieve organizations",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}

/**
 * POST /api/organizations
 * Creates a new organization
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      registrationNo,
      contactEmail,
      contactPhone,
      address,
      city,
      state,
      country,
    } = body;

    if (
      !name ||
      !registrationNo ||
      !contactEmail ||
      !contactPhone ||
      !address ||
      !city ||
      !state
    ) {
      return sendError(
        "Missing required fields",
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        400
      );
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { registrationNo },
    });
    if (existingOrg) {
      return sendError(
        "Organization with this registration number already exists",
        ERROR_CODES.DUPLICATE_ENTRY,
        400
      );
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        registrationNo,
        contactEmail,
        contactPhone,
        address,
        city,
        state,
        country: country || "India",
      },
    });

    return sendSuccess(organization, "Organization created successfully", 201);
  } catch (error) {
    return sendError(
      "Failed to create organization",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}
