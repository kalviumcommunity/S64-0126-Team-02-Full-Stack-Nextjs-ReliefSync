import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";
import { NextResponse } from "next/server";

/**
 * JWT Secret Key
 * In production, always use environment variable
 */
const JWT_SECRET: Secret = process.env.JWT_SECRET || "supersecretkey";

/**
 * JWT Token Expiry Time
 * Default: 1 hour
 */
const JWT_EXPIRES_IN = "1h";

/**
 * JWT Payload Interface
 */
export interface TokenPayload {
  id: number;
  email: string;
  role: string;
}

/**
 * Decoded Token Interface (extends JwtPayload for additional JWT fields)
 */
export interface DecodedToken extends TokenPayload, JwtPayload {}

/**
 * Generate JWT Token
 * Creates a signed JWT token with user information
 *
 * @param payload - User data to encode in the token
 * @returns Signed JWT token string
 */
export function generateToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Verify JWT Token
 * Validates and decodes a JWT token
 *
 * @param token - JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Extract Token from Authorization Header
 * Parses the Bearer token from the Authorization header
 *
 * @param authHeader - Authorization header value
 * @returns Token string or null if not found
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.split(" ")[1];
}

/**
 * Authentication Middleware Helper
 * Validates JWT token from request headers
 *
 * @param req - Incoming request
 * @returns Object containing authentication status and decoded user
 */
export function authenticateRequest(req: Request): {
  isAuthenticated: boolean;
  user: DecodedToken | null;
  error: NextResponse | null;
} {
  const authHeader = req.headers.get("authorization");
  const token = extractToken(authHeader);

  if (!token) {
    return {
      isAuthenticated: false,
      user: null,
      error: NextResponse.json(
        {
          success: false,
          message: "Authentication required. Token missing.",
        },
        { status: 401 }
      ),
    };
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return {
      isAuthenticated: false,
      user: null,
      error: NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token",
        },
        { status: 403 }
      ),
    };
  }

  return {
    isAuthenticated: true,
    user: decoded,
    error: null,
  };
}
