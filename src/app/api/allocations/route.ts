import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { AllocationStatus } from "@prisma/client";
import { createAllocationSchema } from "@/lib/schemas/allocationSchema";
import {
  createValidationErrorResponse,
  createSuccessResponse,
  createErrorResponse,
} from "@/lib/validation";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

/**
 * GET /api/allocations
 * Retrieves all allocations with pagination and filtering
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 10;
    const status = searchParams.get("status") as AllocationStatus | null;
    const toOrgId = searchParams.get("toOrgId");
    const fromOrgId = searchParams.get("fromOrgId");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (toOrgId) where.toOrgId = parseInt(toOrgId, 10);
    if (fromOrgId) where.fromOrgId = parseInt(fromOrgId, 10);

    const whereClause = Object.keys(where).length > 0 ? where : undefined;

    const [allocations, total] = await Promise.all([
      prisma.allocation.findMany({
        ...(whereClause && { where: whereClause }),
        include: {
          fromOrg: { select: { id: true, name: true } },
          toOrg: { select: { id: true, name: true } },
          approver: { select: { id: true, name: true } },
        },
        skip,
        take: limit,
        orderBy: { requestDate: "desc" },
      }),
      prisma.allocation.count(whereClause ? { where: whereClause } : undefined),
    ]);

    return sendSuccess(allocations, "Allocations retrieved successfully", 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return sendError(
      "Failed to fetch allocations",
      ERROR_CODES.DATABASE_ERROR,
      500,
      error
    );
  }
}

/**
 * POST /api/allocations
 * Creates a new allocation request with Zod validation
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = createAllocationSchema.parse(body);

    // Check if recipient organization exists
    const toOrg = await prisma.organization.findUnique({
      where: { id: validatedData.toOrgId },
    });
    if (!toOrg) {
      return createErrorResponse("Recipient organization not found", 404);
    }

    // Check if source organization exists (if provided)
    if (validatedData.fromOrgId) {
      const fromOrg = await prisma.organization.findUnique({
        where: { id: validatedData.fromOrgId },
      });
      if (!fromOrg) {
        return createErrorResponse("Source organization not found", 404);
      }
    }

    // Create allocation
    const allocation = await prisma.allocation.create({
      data: {
        fromOrgId: validatedData.fromOrgId || null,
        toOrgId: validatedData.toOrgId,
        itemId: validatedData.itemId,
        quantity: validatedData.quantity,
        requestedBy: validatedData.requestedBy,
        notes: validatedData.notes || null,
        status: "PENDING",
      },
      include: {
        fromOrg: { select: { id: true, name: true } },
        toOrg: { select: { id: true, name: true } },
      },
    });

    return createSuccessResponse(
      "Allocation request created successfully",
      allocation,
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error creating allocation:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
