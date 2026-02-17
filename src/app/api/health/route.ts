import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import redis from "@/lib/redis";
import { getAuthUser } from "@/lib/authorization";
import { sendError } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

/**
 * GET /api/health
 * Health check endpoint for monitoring system status
 *
 * Checks:
 * - API availability
 * - Database connectivity
 * - Redis connectivity
 *
 * Response:
 * - 200: All systems operational
 * - 503: One or more systems unavailable
 */
export async function GET(req: Request) {
  const authUser = getAuthUser(req);
  if (!authUser) {
    return sendError("Unauthorized", ERROR_CODES.UNAUTHORIZED, 401);
  }

  const appVersion =
    process.env.APP_VERSION || process.env.npm_package_version || "unknown";
  const environment = process.env.NODE_ENV || "development";

  const checks = {
    api: { status: "healthy", message: "API is operational" },
    database: { status: "unknown", message: "" },
    redis: { status: "unknown", message: "" },
  };

  let overallStatus = 200;

  // Check Database
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database.status = "healthy";
    checks.database.message = "Database connected";
  } catch (error) {
    checks.database.status = "unhealthy";
    checks.database.message =
      error instanceof Error ? error.message : "Database connection failed";
    overallStatus = 503;
  }

  // Check Redis
  try {
    const testKey = "health:check";
    await redis.setex(testKey, 10, "ok");
    const result = await redis.get(testKey);
    if (result === "ok") {
      checks.redis.status = "healthy";
      checks.redis.message = "Redis connected";
    } else {
      checks.redis.status = "degraded";
      checks.redis.message = "Redis available but caching may be disabled";
    }
  } catch (error) {
    checks.redis.status = "unhealthy";
    checks.redis.message =
      error instanceof Error ? error.message : "Redis connection failed";
    // Redis is optional, so don't fail health check
    checks.redis.message += " (optional service)";
  }

  const response = {
    status: overallStatus === 200 ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    app: {
      version: appVersion,
      environment,
    },
    checks,
  };

  return NextResponse.json(response, { status: overallStatus });
}
