# Redis Configuration Guide

## Environment Variables

Add these environment variables to your `.env.local` file for local development:

```bash
# Redis Connection
REDIS_URL=redis://localhost:6379

# Optional: If using Redis with authentication
# REDIS_URL=redis://:password@redis-host:6379
```

## Local Development Setup

### Option 1: Redis with Docker (Recommended)

```bash
# Start Redis in a container
docker run -d -p 6379:6379 --name redis redis:latest

# Verify connection
redis-cli ping
# Output: PONG
```

### Option 2: Install Redis Locally

**Windows (WSL or native):**
```bash
# Using Chocolatey
choco install redis

# Start Redis
redis-server
```

**macOS:**
```bash
# Using Homebrew
brew install redis

# Start Redis
redis-server
```

**Linux:**
```bash
sudo apt-get install redis-server
redis-server
```

### Option 3: Redis Cloud (Managed Service)

1. Sign up at [Redis Cloud](https://redis.cloud)
2. Create a free tier database
3. Copy the connection URL
4. Add to `.env.local`:
   ```bash
   REDIS_URL=redis://:[password]@[host]:[port]
   ```

## Verifying Redis Connection

### Using Redis CLI

```bash
# Connect to Redis
redis-cli

# Test connection
> ping
PONG

# Check keys
> KEYS *

# View specific key
> GET users:list:1:10:all

# Clear cache
> FLUSHDB
```

### Using Application Logs

The application will log Redis connection status:

```
✅ Redis connected
```

If you see:
```
❌ Redis connection error: [error message]
```

Troubleshooting steps:
1. Verify Redis is running
2. Check connection URL in `.env.local`
3. Ensure Redis port (default 6379) is not blocked
4. Check Redis authentication credentials

## Production Deployment

For production environments (Vercel, AWS, etc.):

1. Use a managed Redis service:
   - AWS ElastiCache
   - Redis Cloud
   - Azure Cache for Redis
   - Heroku Redis

2. Set `REDIS_URL` environment variable in deployment platform:
   - Vercel: Settings → Environment Variables
   - AWS: Environment variables in Lambda/EC2
   - Heroku: Config Vars

3. Use strong passwords and enable encryption:
   ```bash
   REDIS_URL=redis://:strongpassword@host:port
   ```

## Monitoring Redis

### View Memory Usage

```bash
redis-cli
> INFO memory
```

### View Cache Statistics

```bash
> INFO stats
```

### Monitor Real-time Commands

```bash
redis-cli monitor
```

## Cache Eviction Policy

By default, Redis stores data in memory. Configure eviction policy in `redis.conf`:

```
# Remove least recently used keys when memory limit reached
maxmemory-policy allkeys-lru

# Keep 256MB max
maxmemory 268435456
```

## Resources

- [Redis Documentation](https://redis.io/docs/)
- [ioredis Client](https://github.com/luin/ioredis)
- [Redis CLI](https://redis.io/docs/manual/cli/)
