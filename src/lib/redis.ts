import Redis from "ioredis";

type RedisKey = string | Buffer;

interface SafeRedisClient {
  get(key: RedisKey): Promise<string | null>;
  setex(key: RedisKey, seconds: number, value: string): Promise<"OK" | string>;
  keys(pattern: string): Promise<string[]>;
  del(...keys: RedisKey[]): Promise<number>;
  sadd(key: RedisKey, ...members: string[]): Promise<number>;
  smembers(key: RedisKey): Promise<string[]>;
  srem(key: RedisKey, ...members: string[]): Promise<number>;
  expire(key: RedisKey, seconds: number): Promise<number>;
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
let hasLoggedConnectionError = false;
let hasLoggedOperationError = false;

const logConnectionErrorOnce = (message: string) => {
  if (hasLoggedConnectionError) return;
  hasLoggedConnectionError = true;
  console.error("❌ Redis connection error:", message);
};

const logOperationErrorOnce = (message: string) => {
  if (hasLoggedOperationError) return;
  hasLoggedOperationError = true;
  console.warn(
    "⚠️ Redis unavailable; caching disabled for this process. Last error:",
    message
  );
};

if (redisUrl) {
  client = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });

  client.on("connect", () => {
    console.log("✅ Redis connected");
  });

  client.on("error", (error) => {
    logConnectionErrorOnce(error.message);
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
    logOperationErrorOnce(message);
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
  sadd: (key, ...members) =>
    safeCall(() => {
      if (members.length === 0) return Promise.resolve(0);
      return client!.sadd(key, ...members);
    }, 0),
  smembers: (key) => safeCall(() => client!.smembers(key), []),
  srem: (key, ...members) =>
    safeCall(() => {
      if (members.length === 0) return Promise.resolve(0);
      return client!.srem(key, ...members);
    }, 0),
  expire: (key, seconds) => safeCall(() => client!.expire(key, seconds), 0),
};

/**
 * Cache invalidation helpers using Redis Sets for tracking
 * This avoids expensive redis.keys() operations in production
 */

/**
 * Track a cache key by adding it to a tracking set
 * @param trackingSet - The set name (e.g., "cache:users:list")
 * @param cacheKey - The actual cache key to track
 * @param ttl - Optional TTL for the tracking set (default: 1 day)
 */
export async function trackCacheKey(
  trackingSet: string,
  cacheKey: string,
  ttl: number = 86400
): Promise<void> {
  await redis.sadd(trackingSet, cacheKey);
  await redis.expire(trackingSet, ttl);
}

/**
 * Invalidate all cache keys tracked in a set
 * @param trackingSet - The set name containing cache keys to invalidate
 * @returns Number of keys deleted
 */
export async function invalidateTrackedKeys(
  trackingSet: string
): Promise<number> {
  const keys = await redis.smembers(trackingSet);
  if (keys.length === 0) return 0;

  const deleted = await redis.del(...keys);
  await redis.del(trackingSet); // Remove the tracking set itself
  return deleted;
}

/**
 * Invalidate a specific cache key and remove it from tracking
 * @param trackingSet - The tracking set name
 * @param cacheKey - The cache key to invalidate
 */
export async function invalidateCacheKey(
  trackingSet: string,
  cacheKey: string
): Promise<void> {
  await redis.del(cacheKey);
  await redis.srem(trackingSet, cacheKey);
}

export default redis;
