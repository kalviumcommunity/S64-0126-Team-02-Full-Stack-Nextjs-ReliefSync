import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, extractToken, type DecodedToken } from "@/lib/auth";

/**
 * Authorization Middleware
 * Validates JWT tokens and enforces role-based access control (RBAC)
 * across protected API routes and pages.
 *
 * This middleware intercepts all incoming requests and:
 * 1. Extracts and validates JWT tokens from cookies
 * 2. Checks user roles against route requirements
 * 3. Denies access to unauthorized users and redirects to login
 * 4. Passes validated user info to downstream handlers via custom headers
 */

// Page routes that require authentication
const PROTECTED_PAGE_ROUTES = ["/dashboard", "/requests"];

// API routes that require authentication
const PROTECTED_API_ROUTES = ["/api/users", "/api/allocations", "/api/inventory", "/api/organizations"];

// Routes that require specific roles (role => required roles)
const ROLE_BASED_ROUTES: Record<string, string[]> = {
  "/api/admin": ["GOVERNMENT"], // Only GOVERNMENT users can access admin routes
};

/**
 * Main middleware handler
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if route is a protected page
  const isProtectedPage = PROTECTED_PAGE_ROUTES.some((route) => pathname.startsWith(route));

  // Check if route is a protected API route
  const isProtectedAPI = PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route));

  // Check if route requires specific roles
  const requiredRoles = ROLE_BASED_ROUTES[pathname] || null;

  // Skip middleware for non-protected routes
  if (!isProtectedPage && !isProtectedAPI && !requiredRoles) {
    return NextResponse.next();
  }

  // Extract token from cookie or Authorization header
  const token = req.cookies.get("auth-token")?.value || 
                extractToken(req.headers.get("authorization"));

  // No token provided
  if (!token) {
    // For page routes, redirect to login
    if (isProtectedPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // For API routes, return JSON error
    return NextResponse.json(
      {
        success: false,
        code: "MISSING_TOKEN",
        message: "Authentication required. Please provide a valid token.",
      },
      { status: 401 }
    );
  }

  // Verify token
  const decoded = verifyToken(token) as DecodedToken | null;

  if (!decoded) {
    // For page routes, redirect to login
    if (isProtectedPage) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    // For API routes, return JSON error
    return NextResponse.json(
      {
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid or expired token. Please authenticate again.",
      },
      { status: 403 }
    );
  }

  // Check role-based access control
  if (requiredRoles && !requiredRoles.includes(decoded.role)) {
    return NextResponse.json(
      {
        success: false,
        code: "INSUFFICIENT_PERMISSIONS",
        message: `Access denied. This endpoint requires one of the following roles: ${requiredRoles.join(", ")}. Your role: ${decoded.role}`,
      },
      { status: 403 }
    );
  }

  // Middleware allows access - pass user info to downstream handlers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", decoded.id.toString());
  requestHeaders.set("x-user-email", decoded.email);
  requestHeaders.set("x-user-role", decoded.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

/**
 * Configure which routes the middleware should run on
 * This ensures the middleware only checks specific patterns for efficiency
 */
export const config = {
  matcher: [
    // Protect page routes
    "/dashboard/:path*",
    "/requests/:path*",
    // Protect all API routes except auth (login/signup)
    "/api/:path*",
    // Exclude auth routes
    "!(api/auth/login|api/auth/signup)",
  ],
};
