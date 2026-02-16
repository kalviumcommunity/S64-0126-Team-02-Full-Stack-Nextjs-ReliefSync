# 🚀 Quick Start Guide - ReliefSync

## Prerequisites
- Node.js 18+ 
- PostgreSQL 15+
- Redis 7+ (optional, for caching)
- Docker & Docker Compose (if using containerized setup)

---

## Option 1: Local Development (Recommended for Development)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
```bash
# Copy the example file
cp .env.example .env

# Edit .env and set these REQUIRED variables:
# JWT_SECRET - Generate with: openssl rand -base64 32
# DATABASE_URL - Your PostgreSQL connection string
# REDIS_URL - Optional, redis://localhost:6379
```

**Example .env:**
```env
JWT_SECRET=abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz56
DATABASE_URL=postgresql://postgres:password@localhost:5432/reliefdb?schema=public
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

### Step 3: Database Setup
```bash
# Run migrations
npx prisma migrate deploy

# Seed the database with sample data
npx prisma db seed

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### Step 4: Start the Development Server
```bash
npm run dev
```

App will be available at **http://localhost:3000**

---

## Option 2: Docker Compose (Production-like Environment)

### Step 1: Update .env for Docker
```env
JWT_SECRET=your-secure-secret-key
DATABASE_URL=postgresql://postgres:password@db:5432/reliefdb?schema=public
REDIS_URL=redis://redis:6379
NODE_ENV=production
```

### Step 2: Start All Services
```bash
docker-compose up --build
```

This starts:
- Next.js app on port 3000
- PostgreSQL on port 5432
- Redis on port 6379

### Step 3: Run Migrations (inside container)
```bash
# In another terminal
docker exec -it nextjs_app npx prisma migrate deploy
docker exec -it nextjs_app npx prisma db seed
```

---

## 🔍 Verify Setup

### 1. Check Environment Variables
```bash
# App should refuse to start without JWT_SECRET and DATABASE_URL
npm run dev
```

### 2. Test API Endpoints

**Health Check (once implemented):**
```bash
curl http://localhost:3000/api/health
```

**Sign Up:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "role": "NGO"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

---

## 🐛 Troubleshooting

### App won't start - JWT_SECRET error
```
FATAL: JWT_SECRET environment variable is not set
```
**Solution:** Add `JWT_SECRET` to your `.env` file. Generate one with:
```bash
openssl rand -base64 32
```

### App won't start - DATABASE_URL error
```
FATAL: DATABASE_URL environment variable is not set
```
**Solution:** Add `DATABASE_URL` to your `.env` file with valid PostgreSQL connection string.

### Redis connection errors but app still works
```
❌ Redis connection error: ...
```
**Solution:** This is expected! App will work without Redis (caching disabled). To enable caching:
1. Start Redis: `redis-server` or `docker run -p 6379:6379 redis:7-alpine`
2. Set `REDIS_URL=redis://localhost:6379` in `.env`
3. Restart the app

### Migration errors
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Then re-run migrations and seed
npx prisma migrate deploy
npx prisma db seed
```

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

---

## 📚 Next Steps

- Read [docs/P0_FIXES_COMPLETE.md](docs/P0_FIXES_COMPLETE.md) for recent security fixes
- Check [docs/RBAC_DESIGN.md](docs/RBAC_DESIGN.md) for authorization details
- Review [docs/CACHING_IMPLEMENTATION.md](docs/CACHING_IMPLEMENTATION.md) for Redis caching strategy
- See [docs/ERROR_HANDLING_ARCHITECTURE.md](docs/ERROR_HANDLING_ARCHITECTURE.md) for API error handling

---

## 🔗 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npx prisma studio       # Visual database editor
npx prisma migrate dev  # Create new migration
npx prisma db push      # Push schema changes
npx prisma db seed      # Seed database

# Docker
docker-compose up       # Start all services
docker-compose down     # Stop all services
docker-compose logs -f  # View logs
```
