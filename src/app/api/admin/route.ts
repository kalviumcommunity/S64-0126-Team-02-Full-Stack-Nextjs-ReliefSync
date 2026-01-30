import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin Route - GET Handler
 * Protected: GOVERNMENT role only
 *
 * This endpoint demonstrates a protected route that is restricted to
 * users with GOVERNMENT role. The middleware validates the JWT and role
 * before this handler is executed.
 *
 * The authenticated user's information is available in request headers:
 * - x-user-id: User ID
 * - x-user-email: User email
 * - x-user-role: User role (GOVERNMENT or NGO)
 */
export async function GET(req: NextRequest) {
  try {
    // Extract user information from headers (set by middleware)
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");
    const userRole = req.headers.get("x-user-role");

    return NextResponse.json(
      {
        success: true,
        message: "Welcome to the Admin Dashboard! You have full access.",
        data: {
          accessLevel: "ADMIN",
          permissions: [
            "view_all_users",
            "view_all_organizations",
            "view_all_allocations",
            "approve_allocations",
            "manage_roles",
            "view_system_stats",
          ],
          authenticatedUser: {
            id: userId,
            email: userEmail,
            role: userRole,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin GET error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * Admin Route - POST Handler
 * Protected: GOVERNMENT role only
 *
 * Example endpoint for admin actions (e.g., system configuration)
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const userEmail = req.headers.get("x-user-email");

    const body = await req.json().catch(() => ({}));

    // Example: Admin can perform sensitive operations
    return NextResponse.json(
      {
        success: true,
        message: "Admin action executed successfully",
        data: {
          action: body.action || "unknown",
          performedBy: {
            id: userId,
            email: userEmail,
          },
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin POST error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
