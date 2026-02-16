import Redis from "ioredis";

type RedisKey = string | Buffer;

interface SafeRedisClient {
  get(key: RedisKey): Promise<string | null>;
  setex(key: RedisKey, seconds: number, value: string): Promise<"OK" | string>;
  keys(pattern: string): Promise<string[]>;
  del(...keys: RedisKey[]): Promise<number>;
}

/**
 * Redis client initialization
 * Connects to Redis using environment variable
 *
 * Environment Variables:
 * - REDIS_URL: Full Redis connection string (e.g., redis://localhost:6379)
 */
const redisUrl = process.env.REDIS_URL;
let client: Redis | null = null;

if (redisUrl) {
  client = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  client.on("connect", () => {
    console.log("✅ Redis connected");
  });

  client.on("error", (error) => {
    console.error("❌ Redis connection error:", error.message);
  });
} else {
  console.warn("⚠️ REDIS_URL not set; caching is disabled.");
}

const safeCall = async <T>(fn: () => Promise<T>, fallback: T): Promise<T> => {
  if (!client) return fallback;
  try {
    return await fn();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("❌ Redis operation failed:", message);
    return fallback;
  }
};

const redis: SafeRedisClient = {
  get: (key) => safeCall(() => client!.get(key), null),
  setex: (key, seconds, value) =>
    safeCall(() => client!.setex(key, seconds, value), "OK"),
  keys: (pattern) => safeCall(() => client!.keys(pattern), []),
  del: (...keys) =>
    safeCall(async () => {
      if (keys.length === 0) return 0;
      return await client!.del(...keys);
    }, 0),
};

export default redis;
