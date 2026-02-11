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

const PUBLIC_ROUTES = ["/login", "/signup"];

const PUBLIC_API_ROUTES = ["/api/auth/login", "/api/auth/signup"];

const PUBLIC_ASSET_PREFIXES = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

// Routes that require specific roles (role => required roles)
const ROLE_BASED_ROUTES: Record<string, string[]> = {
  "/api/admin": ["GOVERNMENT"], // Only GOVERNMENT users can access admin routes
};

/**
 * Main middleware handler
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for Next.js internals and common public assets
  if (PUBLIC_ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Always allow auth endpoints
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api/");

  // Extract token from cookie or Authorization header
  const token =
    req.cookies.get("auth-token")?.value ||
    extractToken(req.headers.get("authorization"));

  // If user is already authenticated and visits /login, send them to /dashboard
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) && token) {
    const decoded = verifyToken(token) as DecodedToken | null;
    if (decoded) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // Allow public routes without auth
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check if route requires specific roles
  const requiredRoles = ROLE_BASED_ROUTES[pathname] || null;

  // No token provided
  if (!token) {
    // For API routes, return JSON error
    if (isApiRoute) {
      return NextResponse.json(
        {
          success: false,
          code: "MISSING_TOKEN",
          message: "Authentication required. Please provide a valid token.",
        },
        { status: 401 }
      );
    }

    // For page routes, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Verify token
  const decoded = verifyToken(token) as DecodedToken | null;

  if (!decoded) {
    // For API routes, return JSON error
    if (isApiRoute) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_TOKEN",
          message: "Invalid or expired token. Please authenticate again.",
        },
        { status: 403 }
      );
    }

    // For page routes, redirect to login
    return NextResponse.redirect(new URL("/login", req.url));
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
