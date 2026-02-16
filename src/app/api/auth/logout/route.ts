import { sendSuccess } from "@/lib/responseHandler";

/**
 * POST /api/auth/logout
 * Logs out the current user by clearing the auth cookie
 *
 * Response:
 * - 200: Logout successful
 */
export async function POST(req: Request) {
  // Create response with logout message
  const response = sendSuccess(null, "Logout successful", 200);

  // Clear the auth-token cookie
  response.cookies.set("auth-token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // Expire immediately
  });

  return response;
}
