import Redis from "ioredis";

/**
 * Redis client initialization
 * Connects to Redis using environment variable or localhost fallback
 *
 * Environment Variables:
 * - REDIS_URL: Full Redis connection string (e.g., redis://localhost:6379)
 *
 * Tip: Always use environment variables for credentials - never hardcode!
 */
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

// Handle connection events
redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (error) => {
  console.error("❌ Redis connection error:", error.message);
});

export default redis;
