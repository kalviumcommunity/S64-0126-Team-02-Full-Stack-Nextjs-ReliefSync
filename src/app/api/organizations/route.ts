import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      prisma.organization.count(where ? { where } : {}),
    ]);

    return NextResponse.json({
      data: organizations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingOrg = await prisma.organization.findUnique({
      where: { registrationNo },
    });
    if (existingOrg) {
      return NextResponse.json(
        { error: "Organization with this registration number already exists" },
        { status: 400 }
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

    return NextResponse.json(
      { message: "Organization created successfully", data: organization },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
