type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __rateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const store = global.__rateLimitStore || new Map<string, RateLimitEntry>();
if (!global.__rateLimitStore) {
  global.__rateLimitStore = store;
}

export function getClientIdentifier(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfIp = req.headers.get("cf-connecting-ip");

  const ip =
    (forwardedFor && forwardedFor.split(",")[0]?.trim()) ||
    realIp ||
    cfIp ||
    "unknown";

  return ip;
}

export function rateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: options.max - 1, resetAt };
  }

  const nextCount = entry.count + 1;
  entry.count = nextCount;
  store.set(key, entry);

  const remaining = Math.max(options.max - nextCount, 0);
  return {
    allowed: nextCount <= options.max,
    remaining,
    resetAt: entry.resetAt,
  };
}
