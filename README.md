# Disaster Relief Coordination Platform

This repository contains the base setup for a full-stack Disaster Relief Coordination Platform built using Next.js (TypeScript). This Sprint-1 deliverable focuses on initializing a clean, scalable project structure.

---

## Problem Statement

Disaster relief operations often face delays due to uncoordinated data sharing between NGOs and government bodies. This project aims to build a scalable platform to improve coordination and data visibility.

---

## Sprint 1 – Project Initialization

The objective of Sprint 1 is to set up a strong foundation using Next.js with TypeScript, following best practices for folder structure and documentation.

---

## Folder Structure
```
src/
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
│
├── components/
│   └── Header.tsx        # Reusable UI components
│
├── lib/
│   └── constants.ts     # Utilities and shared helpers
```

This structure ensures separation of concerns and supports scalability in future sprints.

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

Before running the application, you must set up your environment variables. See the **Environment Variables** section below for detailed instructions.

Quick setup:
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your actual values
```

### 3. Run Locally
```bash
npm run dev
```
The application runs at ```http://localhost:3000```

---

## 🔐 Environment Variables

This project uses Next.js environment variable management to safely handle configuration and secrets. Understanding how to properly configure these variables is critical for security and functionality.

---

### 📋 Required Environment Variables

All environment variables are documented in [.env.example](.env.example). Below is a comprehensive list:

#### **Server-Side Variables** (Private - Never Exposed to Client)

| Variable | Type | Description | Example | Security Level |
|----------|------|-------------|---------|----------------|
| `DATABASE_URL` | String | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` | 🔴 **CRITICAL** |
| `JWT_SECRET` | String | Secret key for JWT token signing | `your-secret-min-32-chars` | 🔴 **CRITICAL** |
| `REDIS_URL` | String | Redis connection string for caching | `redis://localhost:6379` | 🟡 **HIGH** |
| `APP_NAME` | String | Application name for cache prefixes | `ReliefSync` | 🟢 **LOW** |
| `NODE_ENV` | String | Runtime environment | `development`, `production`, `test` | 🟢 **LOW** |

#### **Client-Side Variables** (Public - Embedded in Browser Bundle)

These variables are prefixed with `NEXT_PUBLIC_` and are accessible in both server and client code.

| Variable | Type | Description | Example | Notes |
|----------|------|-------------|---------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | String | API base URL (if needed) | `http://localhost:3000/api` | ⚠️ Optional |
| `NEXT_PUBLIC_APP_NAME` | String | Public app name for branding | `ReliefSync` | ⚠️ Optional |

> **⚠️ WARNING**: Never put secrets in `NEXT_PUBLIC_` variables! They are embedded in the client bundle and visible to anyone.

---

### 🔒 Security Best Practices

#### 1. **Server-Only vs. Client-Accessible Variables**

**Server-Only Variables** (accessed via `process.env`):
- Only available in server-side code (API routes, `getServerSideProps`, etc.)
- Never sent to the browser
- Perfect for database credentials, API keys, JWT secrets

```typescript
// ✅ CORRECT: Server-side only (e.g., in /src/lib/auth.ts)
const JWT_SECRET = process.env.JWT_SECRET || "fallback";
```

**Client-Accessible Variables** (prefixed with `NEXT_PUBLIC_`):
- Embedded in the browser bundle at build time
- Accessible in both server and client code
- Only use for non-sensitive configuration

```typescript
// ✅ CORRECT: Public variable for client-side use
const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
```

```typescript
// ❌ WRONG: Never expose secrets with NEXT_PUBLIC_
const secret = process.env.NEXT_PUBLIC_JWT_SECRET; // DON'T DO THIS!
```

#### 2. **Git Protection Strategy**

Our `.gitignore` is configured to prevent accidental commits:

```gitignore
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

This pattern:
- ✅ Ignores all `.env` files (`.env.local`, `.env.production`, etc.)
- ✅ Allows `.env.example` to be committed as a template
- ✅ Prevents accidental exposure of secrets

#### 3. **Multi-Layer Protection**

We implement defense-in-depth with multiple security layers:

| Layer | Protection Mechanism | Purpose |
|-------|---------------------|---------|
| **Layer 1** | `.gitignore` rules | Prevents Git from tracking `.env.local` |
| **Layer 2** | `.env.example` template | Documents required variables without exposing values |
| **Layer 3** | Next.js scoping | Server variables (`process.env`) never reach the client |
| **Layer 4** | Code reviews | PR checklist includes environment variable security checks |
| **Layer 5** | Environment validation | Runtime checks ensure required variables are set |

---

### 🛡️ How We Prevent Accidental Leaks

#### Scenario: "What if a teammate accidentally pushes .env.local to GitHub?"

**Our Multi-Layer Defense:**

1. **Prevention (Layer 1 - `.gitignore`)**:
   - `.env.local` is explicitly ignored
   - Git won't track or stage this file
   - Even `git add -A` won't include it

2. **Detection (Layer 2 - Pre-commit Hooks)** (Optional - Can be added):
   - Tools like `husky` can scan for secrets before commit
   - Blocks commits containing suspicious patterns

3. **Code Review (Layer 3)**:
   - Pull request template includes security checklist
   - Reviewers verify no secrets in code or committed files

4. **Runtime Protection (Layer 4)**:
   - Server-only variables are never sent to client
   - Next.js strips non-`NEXT_PUBLIC_` variables from client bundle

5. **Damage Control (Layer 5)**:
   - If `.env.local` is somehow committed:
     - Immediately rotate all secrets (JWT_SECRET, database passwords)
     - Remove file from Git history: `git filter-branch` or BFG Repo-Cleaner
     - Revoke compromised credentials

**Example Incident Response:**
```bash
# If .env.local was committed:
# 1. Remove from repository
git rm --cached .env.local
git commit -m "Remove accidentally committed .env.local"

# 2. Remove from Git history (use BFG)
bfg --delete-files .env.local
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 3. Rotate all secrets immediately
# - Generate new JWT_SECRET
# - Change database passwords
# - Update Redis credentials
```

---

### 📝 Setup Instructions

1. **Copy the template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in actual values:**
   Edit `.env.local` with your real configuration:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/reliefync_db"
   JWT_SECRET="generate-using-openssl-rand-base64-32"
   REDIS_URL="redis://localhost:6379"
   APP_NAME="ReliefSync"
   ```

3. **Verify protection:**
   ```bash
   # Check that .env.local is ignored
   git status
   # .env.local should NOT appear in untracked files
   ```

4. **Generate secure secrets:**
   ```bash
   # Generate a secure JWT secret
   openssl rand -base64 32
   ```

---

### 🔍 Where Variables Are Used

| File | Variables Used | Purpose |
|------|----------------|---------|
| [src/lib/auth.ts](src/lib/auth.ts#L8) | `JWT_SECRET` | JWT token signing and verification |
| [src/lib/prisma.ts](src/lib/prisma.ts#L22) | `DATABASE_URL`, `NODE_ENV` | Database connection and logging |
| [src/lib/redis.ts](src/lib/redis.ts#L12) | `REDIS_URL` | Redis caching connection |
| [prisma/seed.ts](prisma/seed.ts#L8) | `DATABASE_URL` | Database seeding |

---

### 🎓 Learning Reflection

**Key Takeaways:**

1. **Separation of Concerns**: 
   - Server secrets stay on the server (no `NEXT_PUBLIC_` prefix)
   - Client variables are intentionally public (with `NEXT_PUBLIC_` prefix)

2. **Defense in Depth**: 
   - Multiple security layers prevent single points of failure
   - `.gitignore` + code reviews + Next.js scoping = robust protection

3. **Documentation is Security**: 
   - `.env.example` serves as both template and documentation
   - Team members know exactly what to configure

4. **Incident Response Readiness**: 
   - We have a plan if secrets are accidentally exposed
   - Rotation procedures are documented and rehearsed

5. **Build-Time vs Runtime**: 
   - `NEXT_PUBLIC_` variables are embedded at build time
   - Server variables are resolved at runtime
   - Understanding this difference prevents security mistakes

**Common Pitfalls Avoided:**
- ❌ Hardcoding secrets in source code
- ❌ Using `NEXT_PUBLIC_` for sensitive data
- ❌ Committing `.env.local` to version control
- ❌ Forgetting fallback values for development
- ❌ Not documenting required variables

---

## Local Run Screenshot

![Local App Running](docs/local-run.png)

---

## Reflection

This folder structure was chosen to keep the codebase modular and scalable. Separating routes, components, and shared logic allows parallel development and easier feature expansion in future sprints.

---

## Future Scope

- Authentication and role-based access
- NGO and Government dashboards
- Database and caching integration
- Docker, CI/CD, and cloud deployment

## 🔀 Team Branching & PR Workflow

To maintain code quality and smooth collaboration, our team follows a structured GitHub workflow inspired by real-world engineering practices.

---

### Branch Naming Strategy

We use the following branch naming conventions:

- `feature/<feature-name>` – New features
- `fix/<bug-name>` – Bug fixes
- `chore/<task-name>` – Maintenance tasks
- `docs/<update-name>` – Documentation updates

Example branches:
- `feature/login-auth`
- `fix/navbar-alignment`
- `docs/update-readme`

All development work is done on feature or fix branches. The `main` branch is protected and only updated through reviewed pull requests.

---

### Pull Request Template

We created a standardized PR template located at: ```.github/pull_request_template.md```

This template ensures every PR includes:
- A clear summary
- List of changes
- Screenshots or evidence
- A quality checklist before merging

---

### Code Review Checklist

Every pull request is reviewed using the following checklist:
- Code follows naming conventions and structure
- Feature verified locally
- No console errors or warnings
- ESLint and Prettier checks pass
- No sensitive data exposed
- Documentation updated if required

---

### Branch Protection Rules

The `main` branch is protected with the following rules:
- Pull request reviews required before merging
- At least one reviewer approval
- Required status checks must pass
- Direct pushes to `main` are disabled

This ensures all changes are reviewed and validated before reaching production.

---

### 📸 Pull Request Evidence

Below is a screenshot of a real pull request showing checks passing and review completed:

![PR Checks Passing](docs/pr-checks.png)

---

### Reflection

This workflow improves collaboration by enforcing consistency, code reviews, and automated checks. It helps prevent bugs, reduces merge conflicts, and ensures the codebase remains stable as the team scales.

---

## 2.13 PostgreSQL Schema Design

### Overview

The database schema is designed with **3rd Normal Form (3NF)** principles to eliminate redundancy, ensure data consistency, and support scalable queries. The schema models the core entities required for the disaster relief coordination platform.

---

### Core Entities & Relationships

#### **Entity-Relationship Diagram**

```
┌─────────────┐
│   User      │
│─────────────┤
│ id (PK)     │
│ email       │──┐
│ name        │  │
│ passwordHash│  │
│ role        │  │
│ orgId (FK)  │  │
│ createdAt   │  │
└─────────────┘  │
       │         │
       └─────────┼────────┐
                 │        │
            ┌────────────────────┐
            │  Organization      │
            │────────────────────┤
            │ id (PK)            │
            │ name               │
            │ registrationNo     │──┐
            │ contactEmail       │  │
            │ contactPhone       │  │
            │ address            │  │
            │ isActive           │  │
            │ createdAt          │  │
            └────────────────────┘  │
                    │               │
         ┌──────────┴──────────┐    │
         │                     │    │
    ┌─────────────┐    ┌────────────────────┐
    │ Inventory   │    │ Allocation         │
    │─────────────┤    │────────────────────┤
    │ id (PK)     │    │ id (PK)            │
    │ orgId (FK)  │    │ fromOrgId (FK)     │
    │ itemId (FK) │    │ toOrgId (FK)       │
    │ quantity    │    │ itemId (FK)        │
    │ minThreshold│    │ quantity           │
    │ maxCapacity │    │ status             │
    │ lastUpdated │    │ requestedBy        │
    └─────────────┘    │ approvedBy (FK)    │
         │             │ requestDate        │
         │             │ approvedDate       │
         │             │ completedDate      │
         │             │ notes              │
         │             └────────────────────┘
         │                     │
         └─────────┬───────────┘
                   │
            ┌──────────────────┐
            │ InventoryItem    │
            │──────────────────┤
            │ id (PK)          │
            │ name             │
            │ description      │
            │ category (ENUM)  │
            │ unit (ENUM)      │
            │ createdAt        │
            └──────────────────┘
```

---

### Key Tables & Attributes

| Table | Purpose | Notable Columns |
|-------|---------|-----------------|
| **User** | Authentication & authorization | email (unique), role (enum), organizationId (FK) |
| **Organization** | NGO details | registrationNo (unique), isActive, address, city |
| **InventoryItem** | Relief supply definitions | name, category (enum), unit (enum) |
| **Inventory** | Org-specific stock levels | quantity, minThreshold, maxCapacity |
| **Allocation** | Resource requests & transfers | status (enum), requestDate, approvedDate, completedDate |

---

### Normalization & Design Rationale

#### **Why 3rd Normal Form (3NF)?**

1. **First Normal Form (1NF):**
   - All attributes contain atomic values (no arrays/nested objects)
   - No repeating groups
   - Example: `Inventory` stores a single quantity, not a list

2. **Second Normal Form (2NF):**
   - Meets 1NF requirements
   - All non-key attributes are fully dependent on the primary key
   - Example: `Inventory` has `organizationId` + `itemId` as composite candidate key

3. **Third Normal Form (3NF):**
   - Meets 2NF requirements
   - No transitive dependencies between non-key attributes
   - Example: Instead of storing `Organization` data in `User`, we use foreign keys

#### **Key Design Decisions**

| Aspect | Decision | Benefit |
|--------|----------|---------|
| **User Roles** | Enum (NGO/GOVERNMENT) | Type-safe, prevents invalid role values |
| **Inventory** | Composite unique key (org + item) | Prevents duplicates, supports aggregations |
| **Allocation Status** | Enum (6 states) | Clear workflow, prevents invalid statuses |
| **Cascading Deletes** | Varies by relationship | RESTRICT on critical links, CASCADE on dependent data |
| **Indexes** | On FK, email, status, dates | Fast queries for common access patterns |

---

### Constraints & Data Integrity

#### **Primary & Foreign Keys**
```
User.organizationId → Organization.id (SET NULL)
Inventory.organizationId → Organization.id (CASCADE)
Inventory.itemId → InventoryItem.id (RESTRICT)
Allocation.fromOrgId → Organization.id (SET NULL)
Allocation.toOrgId → Organization.id (RESTRICT)
Allocation.approvedBy → User.id (SET NULL)
```

#### **Unique Constraints**
- `User.email` – No duplicate emails
- `Organization.registrationNo` – Unique registration
- `InventoryItem(name, category)` – Prevent duplicate items
- `Inventory(organizationId, itemId)` – One record per org per item

---

### Database Migrations & Seeding

#### **Migrations Executed**
```bash
$ npx prisma migrate dev --name init_schema

Applied migration: 20260128060658_init_schema
```

All tables created successfully in PostgreSQL.

#### **Seeded Test Data**
```bash
$ npx prisma db seed

Created 3 NGO Organizations
Created 5 Users (2 Government, 3 NGO)
Created 8 Relief Item Types
Created 12 Inventory Records
Created 5 Allocation Records
```

**Test Login Credentials** (password: `password123`):
- Government: `admin@gov.in`, `coordinator@ndma.gov.in`
- Red Cross: `manager@redcross.india.org`
- Care India: `manager@careindia.org`
- Oxfam India: `manager@oxfamindia.org`

---

### Query Patterns & Performance

#### **Optimized Indexes**

| Index | Query Pattern | Use Case |
|-------|---------------|----------|
| `User(email)` | Find user by email | Login/authentication |
| `Inventory(organizationId)` | Get NGO inventory | NGO dashboard |
| `Allocation(status)` | List by workflow state | Government admin panel |
| `Inventory(quantity)` | Find low stock items | Threshold alerts |
| `Allocation(requestDate)` | Timeline queries | Audit logs |

#### **Example Prisma Query**
```typescript
// Low stock alert for NGO
const alerts = await prisma.inventory.findMany({
  where: {
    organizationId: ngoId,
    quantity: { lt: prisma.inventory.fields.minThreshold }
  },
  include: { item: true }
});

// Allocation approval workflow
const pending = await prisma.allocation.findMany({
  where: { status: 'PENDING' },
  orderBy: { requestDate: 'asc' },
  include: { fromOrg: true, toOrg: true }
});
```

---


**Visual Schema (Prisma Studio):**

![Prisma Studio Schema Visualization](docs/prisma-studio-schema.png)

This shows the complete database schema with all 5 tables (User, Organization, InventoryItem, Inventory, Allocation) and their relationships as rendered by Prisma Studio.

---

### Scalability Considerations

**Current Design Supports:**

- 100+ NGOs with 1000s of inventory records
- Complex allocation workflows with audit trails
- Sub-second queries on indexed columns
- Batch operations via Prisma

**Future Optimizations:**

- Redis caching for dashboard aggregations
- Materialized views for complex reports
- Partitioning allocations by date (time-series data)
- Archive old allocations to separate table

---

### Reflections & Lessons

**Strengths:**
- Normalized design prevents data anomalies
- Composite keys in `Inventory` prevent duplicates elegantly
- Enum types catch invalid values at compile-time (TypeScript)
- Appropriate cascading rules maintain referential integrity
- Strategic indexes support all common query patterns

**Future Work:**
- Add audit tables to track all CREATE/UPDATE/DELETE operations
- Implement row-level security (RLS) for multi-tenant isolation
- Add triggers for automatic timestamp updates
- Create views for aggregations (e.g., total items per category)

---

### Viewing the Schema

**Interactive Exploration:**
```bash
npx prisma studio
# Opens http://localhost:5555 for visual schema browsing
```

**View Generated SQL:**
```bash
cat prisma/migrations/20260128060658_init_schema/migration.sql
```

---

## 2.14 Prisma ORM Setup & Client Initialisation

### Overview

Prisma ORM is integrated into the Next.js application as the primary data access layer. It provides type-safe database queries, automatic migrations, and seamless TypeScript integration. The client is initialized as a singleton to prevent connection pool exhaustion during development.

---

### What is Prisma ORM?

**Prisma** is a modern Node.js and TypeScript ORM that:
- Generates type-safe database clients from your schema
- Provides an intuitive API for querying databases
- Handles migrations automatically with version control
- Reduces boilerplate SQL code significantly
- Prevents SQL injection with parameterized queries
- Offers a visual database editor (Prisma Studio)

**Benefits for This Project:**
- Type-safe queries catch errors at compile-time (not runtime)
- Auto-generated types mean no manual type definitions
- Migrations are version-controlled and reversible
- Queries are readable and maintainable
- Relationship loading with `include()` prevents N+1 queries

---

### Installation & Setup

#### **1. Installed Prisma**
```bash
npm install @prisma/client prisma @prisma/adapter-pg pg
npm install --save-dev @types/node @types/pg
```

#### **2. Prisma Already Initialized**
```bash
npx prisma init
```

Created:
- `prisma/schema.prisma` – Data models
- `prisma/migrations/` – Version-controlled schema changes
- `.env` – Database connection string

#### **3. Configuration**
- **File:** `prisma.config.ts`
- **Database:** PostgreSQL 15 (via Docker Compose)
- **Adapter:** `@prisma/adapter-pg` for optimal PostgreSQL support
- **Schema:** Located in `prisma/schema.prisma`

---

### Prisma Client Singleton Pattern

#### **File:** `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}
```

**Why This Pattern?**
- Reuses connection pool across hot reloads
- Prevents "too many connections" errors
- Logs queries in development for debugging
- Silent in production (only errors logged)
- Standard Next.js best practice

---

### Query Functions & Type Safety

Organized query functions in `src/lib/queries/` directory with 15+ functions:

#### **1. Users** (`src/lib/queries/users.ts`)
- `getUsers()` – All users with organization
- `getUserByEmail(email)` – Single user with allocations
- `getUsersByRole(role)` – Filter by NGO or GOVERNMENT
- `countUsers()` – Total user count

#### **2. Organizations** (`src/lib/queries/organizations.ts`)
- `getOrganizations()` – All orgs with counts
- `getOrganizationById(id)` – Single org with full details
- `getActiveOrganizations()` – Only active NGOs
- `countOrganizations()` – Total count
- `getOrganizationByRegistration(regNo)` – Lookup by registration

#### **3. Allocations** (`src/lib/queries/allocations.ts`)
- `getAllAllocations()` – All allocations with relationships
- `getAllocationsByStatus(status)` – Filter by workflow state
- `getAllocationsToOrganization(orgId)` – Received allocations
- `getAllocationsFromOrganization(orgId)` – Sent allocations
- `getPendingAllocations()` – Urgent approvals needed
- `countAllocationsByStatus()` – Status distribution
- `getAllocationsByDateRange(start, end)` – Time-based queries

---

### Type Safety in Action

#### **Example: Compile-Time Type Checking**
```typescript
import { getUsers } from '@/lib/queries/users';

const users = await getUsers();
// ✅ Type: Array<User & { organization: Organization | null }>

users[0].name           // ✅ Property exists
users[0].organization?.name  // ✅ Safe optional chaining
users[0].invalidProp    // ❌ TypeScript error (property doesn't exist)
```

#### **Prevent N+1 Queries**
```typescript
// ✅ Single query with eager loading
const orgs = await prisma.organization.findMany({
  include: {
    users: true,           // Loaded in same query
    inventories: true,     // No extra queries
    allocationsFrom: true,
  },
});
```

---

### Query Execution & Performance

#### **Connected to Database**
```
Database: PostgreSQL reliefdb
Host: localhost:5432
Migration: 20260128060658_init_schema (5 tables, 13 indexes)
Seeded Data: 3 organizations, 5 users, 8 items, 12 inventory, 5 allocations
```

#### **Example Query Output**
```typescript
const ngoUsers = await getUsersByRole('NGO');
// ✅ Returns:
// [
//   {
//     id: 3,
//     email: 'manager@redcross.india.org',
//     name: 'Rajesh Kumar',
//     role: 'NGO',
//     organizationId: 1,
//     organization: { id: 1, name: 'Red Cross India', ... }
//   },
//   ...
// ]
```

---

### Prisma Studio: Visual Database Explorer

**Interactive GUI for data exploration:**
```bash
npx prisma studio
# Opens http://localhost:5555
```

**Features:**
- Browse all tables and records
- Add/edit/delete records visually
- View relationships between tables
- Filter and search data
- Perfect for testing queries during development

**Screenshot Shows:**
- 5 tables with all relationships
- Sample data from seeding
- Type information for each column

---

### Developer Experience Benefits

#### **1. Type Safety**
```typescript
// ✅ Errors caught at compile-time, not runtime
const user = await prisma.user.findUnique({ where: { id: 1 } });
user.organization?.name;  // ✅ Safe, autocomplete works
```

#### **2. Readable Queries**
```typescript
// ✅ Declarative, SQL-like but better
const results = await prisma.allocation.findMany({
  where: {
    status: 'PENDING',
    toOrgId: 1,
  },
  include: { fromOrg: true, toOrg: true },
  orderBy: { requestDate: 'asc' },
  take: 10,
});
```

#### **3. IDE Autocomplete**
```typescript
await prisma.user.
//              ↓ Shows: findMany | findUnique | findFirst | count | create | update | delete

await prisma.user.findMany({
  where: {
    //  ↓ Shows: id | email | name | role | organizationId ...
    email: { contains: '' },
  },
});
```

#### **4. Automatic Migrations**
```bash
# 1. Edit prisma/schema.prisma
# 2. Run: npx prisma migrate dev --name describe_change
# 3. Automatic migration created in prisma/migrations/
# 4. All version-controlled and reversible
```

---

### Real-World Use Cases in This Project

| Use Case | Query Function | Benefit |
|----------|---|---|
| NGO Dashboard | `getOrganizationById()` | Get all inventory with organization |
| Government Admin | `getAllocationsByStatus('PENDING')` | See urgent approvals |
| Low Stock Alert | Custom: `quantity < minThreshold` | Prevent shortages |
| Audit Trail | `getAllocationsByDateRange()` | Compliance reporting |
| Org Lookup | `getOrganizationByRegistration()` | Registration-based access |

---

### Reflections on Prisma ORM

**Strengths:**
**Type Safety** – Errors caught before runtime  
**Developer Productivity** – Less boilerplate, more readable  
**Migration Management** – Version-controlled schema changes  
**Relationship Loading** – Prevents N+1 query problems  
**Query Builder** – Intuitive API vs raw SQL strings  
**Debugging** – Prisma Studio for visual exploration  
**IDE Support** – Full autocomplete and type hints  

**Why Prisma Over Raw SQL:**
- Raw SQL: String-based, typos cause runtime errors
- Raw SQL: N+1 query problems hard to debug
- Raw SQL: No IDE autocomplete
- Prisma: Type-safe, prevents classes of errors
- Prisma: Query builder prevents N+1
- Prisma: Full IDE support

**How It Improves Code Quality:**
1. **Compile-Time Safety** – TypeScript catches errors before execution
2. **Readable Queries** – SQL-like but more intuitive
3. **Less Code** – No manual mapping from SQL to objects
4. **Consistency** – Same patterns everywhere
5. **Easy Refactoring** – Rename a field, get compilation errors

---

### File Structure

```
src/
├── lib/
│   ├── prisma.ts                 #  Singleton pattern
│   └── queries/
│       ├── users.ts              # 4 user queries
│       ├── organizations.ts       # 5 organization queries
│       └── allocations.ts         # 6 allocation queries
│
prisma/
├── schema.prisma                 # 5 models, 4 enums
├── migrations/
│   └── 20260128060658_init_schema/
│       └── migration.sql          # Generated SQL
└── seed.ts                        # Test data
```

---

### Testing & Verification

Created `test-queries.ts` to verify database connection and query execution:

```bash
$ npx tsx test-queries.ts
```

**Screenshot Evidence:**

![Prisma Query Test Results](docs/prisma-test-results.png)

---

**Evidence of Success:**
1. ✅ Successful database connection using PrismaClient with PrismaPg adapter
2. ✅ Type-safe queries executing correctly
3. ✅ Relationship loading working (organizations included with users/allocations)
4. ✅ Aggregations functioning (`_count` for user totals)
5. ✅ All 4 test queries passed without errors

The Prisma ORM setup is fully functional and ready for use in the application!

---

### Next Steps for Implementation

1. **Use in API Routes** – Import and call query functions
2. **Use in Server Components** – Fetch data directly in React
3. **Add Caching** – Wrap queries with Redis for performance
4. **Error Handling** – Add try-catch and validation
5. **Aggregations** – Create dashboard summary queries
6. **Real-time Updates** – Extend with WebSocket subscriptions

---

### Summary

**Prisma Client** initialized as singleton in `src/lib/prisma.ts`  
**15+ Query Functions** organized in `src/lib/queries/`  
**Type-Safe Queries** with auto-generated TypeScript types  
**Database Connected** with test data seeded  
**Prisma Studio** available for visual exploration  
**Best Practices** followed per Next.js documentation  

**Result:** A production-ready ORM setup with strong type safety, excellent developer experience, and performance optimizations built-in.

---

## 2.15 Database Migrations & Seed Scripts

### What is Database Migration?

A **migration** captures the evolution of your database schema over time. When you modify your Prisma models (add tables, change fields, add constraints), migrations record those changes as SQL scripts that can be applied consistently across your entire team and deployment environments.

**Why Migrations Matter:**
- ✅ **Reproducibility** – Everyone has the same schema
- ✅ **Auditability** – See what changed and when
- ✅ **Safety** – Test migrations before production
- ✅ **Rollback** – Undo changes if needed
- ✅ **CI/CD** – Automate deployments with confidence

### Seed Scripts

A **seed script** is a TypeScript/JavaScript file that populates your database with initial test data. This ensures that:
- Development environments have realistic data
- Teams don't need to manually create test records
- Migrations can be reset and seeded consistently
- Idempotent operations prevent duplicate data

### Current Status

**Migration Files Created:**

```
prisma/
├── migrations/
│   ├── 20260128060658_init_schema/
│   │   └── migration.sql          # Full schema creation
│   └── migration_lock.toml        # PostgreSQL lock file
└── seed.ts                        # Seed script with test data
```

**Migration Applied:**
```
$ npx prisma migrate status

✓ Loaded Prisma config from prisma.config.ts
✓ Prisma schema loaded from prisma\schema.prisma
✓ Datasource "db": PostgreSQL database "reliefdb", schema "public" at "localhost:5432"

1 migration found in prisma/migrations

Database schema is up to date!
```

### Seed Script Implementation

**File:** `prisma/seed.ts` (336 lines)

The seed script is fully implemented with:

```typescript
// Clear existing data (prevents duplicates)
await prisma.allocation.deleteMany();
await prisma.inventory.deleteMany();
await prisma.inventoryItem.deleteMany();
await prisma.user.deleteMany();
await prisma.organization.deleteMany();

// Create Organizations
const redCross = await prisma.organization.create({
  data: {
    name: 'Red Cross India',
    registrationNo: 'RC-IND-2020-001',
    contactEmail: 'contact@redcross.india.org',
    // ... more fields
  },
});

// Create Users with bcrypt password hashing
const users = await prisma.user.createMany({
  data: [
    {
      email: 'admin@gov.in',
      passwordHash: bcrypt.hashSync('password123', 10),
      name: 'Government Administrator',
      role: 'GOVERNMENT',
    },
    // ... more users
  ],
});

// Create InventoryItems, Inventory records, and Allocations
// ...
```

**Key Features:**
- ✅ Idempotent: Clears data before seeding (no duplicates)
- ✅ Password hashing: Uses bcrypt for security
- ✅ Comprehensive data: 3 orgs, 5 users, 8 items, 12 inventory, 5 allocations
- ✅ Error handling: Try-catch with proper disconnection
- ✅ Seed reference in `package.json` (configured in prisma.config.ts)

### Running Migrations & Seeds

**1. Create a New Migration**

When you modify `schema.prisma`:

```bash
$ npx prisma migrate dev --name add_feature_description
```

This will:
- Generate migration SQL file
- Apply changes to your database
- Update generated Prisma Client types

**2. Run the Seed Script**

```bash
$ npx prisma db seed
```

**Successful Seed Output:**

```
Loaded Prisma config from prisma.config.ts.

Running seed command `tsx prisma/seed.ts` ...
🌱 Starting database seeding...
✅ Cleared existing data
✅ Created 3 NGO organizations
✅ Created 5 users (2 Government, 3 NGO)
✅ Created 8 inventory items
✅ Created 12 inventory records across 3 organizations
✅ Created 5 allocation records with various statuses

🎉 Database seeding completed successfully!

📊 Summary:
  - 3 NGO Organizations
  - 5 Users (2 Government, 3 NGO)
  - 8 Relief Item Types
  - 12 Inventory Records
  - 5 Allocation Records

🔐 Login Credentials (all passwords: password123):
  Government:
    - admin@gov.in
    - coordinator@ndma.gov.in
  NGOs:
    - manager@redcross.india.org (Red Cross)
    - manager@careindia.org (Care India)
    - manager@oxfamindia.org (Oxfam India)
```

**3. Verify Seed Data**

Open Prisma Studio to visually inspect seeded data:

```bash
$ npx prisma studio
# Opens http://localhost:5555
```

Browse tables to confirm:
- ✅ 3 organizations created
- ✅ 5 users with hashed passwords
- ✅ 8 inventory items defined
- ✅ 12 inventory allocations
- ✅ 5 allocation workflow records

### Rollback & Reset

**Safe Rollback in Development:**

```bash
# Reset entire database (lose all data!)
$ npx prisma migrate reset
# This will:
# 1. Delete database
# 2. Re-run all migrations
# 3. Re-run seed script
```

**In Production (Careful!):**

```bash
# Revert to previous migration state
$ npx prisma migrate resolve --rolled-back 20260128060658_init_schema
```

**Best Practice:** Use `migrate resolve` only after manually reverting SQL changes in production database with backup.

### Migration Workflow

```
┌─────────────────────────────────────────────────────────┐
│ Development: Modify schema.prisma                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │ npx prisma migrate dev     │
        │ --name add_feature         │
        └────────┬───────────────────┘
                 │
                 ▼
    ┌──────────────────────────────────┐
    │ Generated SQL Migration File      │
    │ in prisma/migrations/            │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ Applied to Local PostgreSQL DB    │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ Prisma Client Types Updated      │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ Commit migration to Git          │
    └────────┬─────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────┐
    │ CI/CD Pipeline                   │
    │ - Test migrations on staging     │
    │ - Apply to production            │
    └──────────────────────────────────┘
```

### Production Data Protection

**Our Approach:**

1. **Staging Database** – Test all migrations on production-like DB first
2. **Backups** – Always backup production before migration
   ```bash
   pg_dump reliefdb > backup_$(date +%Y%m%d_%H%M%S).sql
   ```
3. **Dry Run** – Use `--skip-generate` flag to preview without applying
4. **Idempotent Seeds** – Seeds clear old data, preventing conflicts
5. **Version Control** – All migrations in Git for auditability
6. **Monitoring** – Track migration execution time and lock issues

**Rollback Plan:**

```bash
# If production migration fails:
# 1. Restore from backup
psql reliefdb < backup_20260128_120000.sql

# 2. Revert migration in version control
# 3. Fix schema issue
# 4. Test on staging
# 5. Deploy fix to production
```

### Schema Versioning

Current schema version: **v1.0** (Initial setup)
- 5 tables: User, Organization, InventoryItem, Inventory, Allocation
- 15+ indexes for query performance
- Foreign key constraints for data integrity
- Timestamp tracking (createdAt, updatedAt) on all entities

### Reflections & Lessons Learned

**Why This Approach Works:**

1. **Reproducibility** – Any developer can reset to clean state instantly
   - `npx prisma migrate reset` takes ~5 seconds
   - Entire team has identical schema
   - No "works on my machine" issues

2. **Auditability** – Every schema change is tracked
   - See who changed what and when (via Git history)
   - Migration files are human-readable SQL
   - Easy to understand database evolution

3. **Safety** – Migrations are reversible
   - Test migrations before production
   - Rollback plan in place
   - No surprise schema mismatches

4. **Scalability** – Pattern works for 100+ tables
   - Migrations can be organized by feature
   - Multiple teams can work on different schema areas
   - Merge conflicts in seed data are rare (different orgs/users)

5. **Developer Experience** – No manual SQL needed
   - Prisma generates migrations from schema
   - TypeScript types auto-update
   - `npx prisma studio` beats psql for casual browsing

**Gotchas We Avoided:**

- ❌ Hardcoded database credentials → ✅ Using .env variables
- ❌ Manual SQL migrations → ✅ Prisma auto-generates from schema
- ❌ Duplicate seed data on reset → ✅ Clear old data first (idempotent)
- ❌ Untracked migrations in Git → ✅ Entire migrations/ folder committed
- ❌ No production backup → ✅ Always backup before production migration

### Next Steps

1. **Feature Branches** – When adding features, update schema then migrate
   ```bash
   git checkout -b feature/add-notifications
   # Update schema.prisma
   npx prisma migrate dev --name add_notifications_table
   ```

2. **Integration Tests** – Reset DB and seed before running tests
   ```typescript
   beforeAll(async () => {
     await exec('npx prisma migrate reset --skip-seed');
     await exec('npx prisma db seed');
   });
   ```

3. **Deployment** – CI/CD pipeline applies migrations before starting app
   ```bash
   npx prisma migrate deploy  # Applies pending migrations (safe for prod)
   ```

4. **Monitoring** – Track migration performance on production
   - Migration execution time
   - Lock duration
   - Rollback frequency (if needed)

### Summary

**Database Migrations** provide version control for your schema  
**Seed Scripts** ensure consistent test data across all environments  
**Prisma Migrate** generates SQL from TypeScript models  
**Rollback Safety** with backups and staging testing  
**Production Ready** with careful deployment practices  

**Result:** Team can confidently evolve database schema together, with reproducible migrations and idempotent seeding.

---

## 2.19 Input Validation with Zod

### Overview

This project uses [Zod](https://zod.dev/) for runtime schema validation on all API endpoints. Zod is a TypeScript-first schema declaration and validation library that ensures all POST and PUT requests receive valid, well-structured data — preventing bad inputs from corrupting the database or crashing the API.

### Why Input Validation Matters

Without validation:
- Users might send malformed JSON or missing fields
- The database could receive invalid or unexpected values
- The application becomes unpredictable or insecure

**Example Problem:**
```json
{
  "name": "",
  "email": "not-an-email"
}
```
If an API endpoint accepts this data unchecked, you risk broken records and confusing errors later.

---

### Installation

Zod is already installed in this project:

```bash
npm install zod
```

---

### Schema Definitions

All validation schemas are located in `src/lib/schemas/`:

#### **User Schema** (`userSchema.ts`)

```typescript
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email address").min(5).max(100),
  name: z.string().min(2, "Name must be at least 2 characters").max(100).trim(),
  passwordHash: z.string().min(8, "Password hash must be at least 8 characters"),
  role: z.enum(["NGO", "GOVERNMENT"], {
    errorMap: () => ({ message: "Role must be either NGO or GOVERNMENT" }),
  }),
  organizationId: z.number().int().positive().optional().nullable(),
});

export const updateUserSchema = z.object({
  email: z.string().email().min(5).max(100).optional(),
  name: z.string().min(2).max(100).trim().optional(),
  passwordHash: z.string().min(8).optional(),
  role: z.enum(["NGO", "GOVERNMENT"]).optional(),
  organizationId: z.number().int().positive().optional().nullable(),
});

// TypeScript types inferred from schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

#### **Organization Schema** (`organizationSchema.ts`)

```typescript
export const createOrganizationSchema = z.object({
  name: z.string().min(2).max(200).trim(),
  registrationNo: z.string().min(3).max(50).regex(/^[A-Z0-9-\/]+$/i),
  contactEmail: z.string().email().max(100),
  contactPhone: z.string().min(10).max(20).regex(/^[\d\s\-\+\(\)]+$/),
  address: z.string().min(5).max(500).trim(),
  city: z.string().min(2).max(100).trim(),
  state: z.string().min(2).max(100).trim(),
  country: z.string().min(2).max(100).default("India"),
  isActive: z.boolean().default(true),
});
```

#### **Inventory Schema** (`inventorySchema.ts`)

```typescript
export const createInventorySchema = z.object({
  organizationId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  quantity: z.number().nonnegative().finite(),
  minThreshold: z.number().nonnegative().default(0),
  maxCapacity: z.number().positive().optional().nullable(),
}).refine(
  (data) => data.maxCapacity === null || data.maxCapacity === undefined || data.maxCapacity >= data.quantity,
  { message: "Maximum capacity must be >= current quantity", path: ["maxCapacity"] }
);
```

#### **Allocation Schema** (`allocationSchema.ts`)

```typescript
export const createAllocationSchema = z.object({
  fromOrgId: z.number().int().positive().optional().nullable(),
  toOrgId: z.number().int().positive(),
  itemId: z.number().int().positive(),
  quantity: z.number().positive(),
  requestedBy: z.string().min(2).max(100).trim(),
  notes: z.string().max(1000).optional().nullable(),
}).refine(
  (data) => !data.fromOrgId || data.fromOrgId !== data.toOrgId,
  { message: "Source and recipient organizations must be different", path: ["toOrgId"] }
);
```

---

### Validation Helper (`lib/validation.ts`)

A centralized validation utility provides consistent error formatting:

```typescript
import { NextResponse } from "next/server";
import { ZodError, ZodSchema } from "zod";

export interface ValidationError {
  field: string;
  message: string;
}

export function formatZodErrors(error: ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
}

export function createValidationErrorResponse(error: ZodError): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message: "Validation Error",
      errors: formatZodErrors(error),
    },
    { status: 400 }
  );
}
```

---

### API Handler Implementation

Example: User creation with Zod validation

```typescript
import { ZodError } from "zod";
import { createUserSchema } from "@/lib/schemas/userSchema";
import { createValidationErrorResponse, createSuccessResponse, createErrorResponse } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body with Zod
    const validatedData = createUserSchema.parse(body);

    // Check business rules (e.g., duplicate email)
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });
    if (existingUser) {
      return createErrorResponse("User with this email already exists", 400);
    }

    // Create user with validated data
    const user = await prisma.user.create({ data: validatedData });

    return createSuccessResponse("User created successfully", user, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return createValidationErrorResponse(error);
    }
    console.error("Error creating user:", error);
    return createErrorResponse("Internal server error", 500);
  }
}
```

---

### Validation Examples

#### ✅ Passing Validation

**Request:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "passwordHash": "hashed_password_123",
    "role": "NGO"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "role": "NGO",
    "organizationId": null,
    "createdAt": "2026-01-30T12:00:00.000Z"
  }
}
```

#### ❌ Failing Validation

**Request:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "A",
    "email": "invalid-email",
    "role": "ADMIN"
  }'
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    { "field": "name", "message": "Name must be at least 2 characters" },
    { "field": "email", "message": "Invalid email address" },
    { "field": "passwordHash", "message": "Required" },
    { "field": "role", "message": "Role must be either NGO or GOVERNMENT" }
  ]
}
```

---

### Testing Validation

Use these commands to test validation in your local environment:

```bash
# Test valid user creation
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","passwordHash":"password123","role":"NGO"}'

# Test invalid organization (missing required fields)
curl -X POST http://localhost:3000/api/organizations \
  -H "Content-Type: application/json" \
  -d '{"name":"A"}'

# Test invalid inventory (negative quantity)
curl -X POST http://localhost:3000/api/inventory \
  -H "Content-Type: application/json" \
  -d '{"organizationId":1,"itemId":1,"quantity":-5}'

# Test invalid allocation (same source and destination)
curl -X POST http://localhost:3000/api/allocations \
  -H "Content-Type: application/json" \
  -d '{"fromOrgId":1,"toOrgId":1,"itemId":1,"quantity":10,"requestedBy":"admin"}'
```

---

### Schema Reuse Between Client and Server

A major benefit of Zod is that schemas can be shared between client and server:

```typescript
// Shared schema file: lib/schemas/userSchema.ts
import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  // ...
});

// Type inference for use in components
export type CreateUserInput = z.infer<typeof createUserSchema>;
```

**Client-side usage (form validation):**
```typescript
import { createUserSchema, CreateUserInput } from "@/lib/schemas/userSchema";

function validateForm(data: unknown): CreateUserInput | null {
  const result = createUserSchema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  // Handle validation errors
  console.log(result.error.errors);
  return null;
}
```

**Server-side usage (API route):**
```typescript
import { createUserSchema } from "@/lib/schemas/userSchema";

const validatedData = createUserSchema.parse(body); // Throws on invalid data
```

---

### Reflection: Why Validation Consistency Matters

1. **Type Safety**: Zod schemas generate TypeScript types, ensuring compile-time and runtime consistency.

2. **Single Source of Truth**: One schema definition validates both client forms and API requests.

3. **Clear Error Messages**: Structured error responses help developers debug and users understand issues.

4. **Business Logic Validation**: Zod's `.refine()` method enables complex cross-field validations.

5. **Team Collaboration**: Shared schemas reduce miscommunication between frontend and backend developers.

6. **Maintainability**: Schema changes automatically update validation logic across the entire application.

---

### Summary

| Feature | Implementation |
|---------|----------------|
| Schema Library | Zod |
| Schema Location | `src/lib/schemas/` |
| Validation Helper | `src/lib/validation.ts` |
| Validated Routes | Users, Organizations, Inventory, Allocations |
| Error Format | `{ success, message, errors[] }` |
| Type Inference | `z.infer<typeof schema>` |
| Cross-field Validation | `.refine()` method |

**Result:** All POST and PUT endpoints now validate input data with clear error messages, preventing invalid data from entering the database and providing consistent feedback to API consumers.

---

## 2.20 Authentication APIs (Signup / Login)

### Overview

This section covers the implementation of secure user authentication using **bcrypt** for password hashing and **JWT (JSON Web Token)** for session management. Authentication is the backbone of secure web applications, ensuring that users are who they claim to be before granting access to protected resources.

---

### Authentication vs Authorization

| Concept | Description | Example |
|---------|-------------|---------|
| **Authentication** | Verifying who the user is | User logs in with email and password |
| **Authorization** | Determining what the user can do | Admin can access `/api/admin`, but regular users cannot |

This implementation focuses on **authentication** — securely verifying user identity.

---

### Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SIGNUP FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User                    API                    Database         │
│   │                       │                        │             │
│   │──── POST /signup ────►│                        │             │
│   │    {name,email,pass}  │                        │             │
│   │                       │                        │             │
│   │                       │──── Check existing ───►│             │
│   │                       │◄─── User not found ────│             │
│   │                       │                        │             │
│   │                       │── Hash password ──┐    │             │
│   │                       │   (bcrypt 10       │    │             │
│   │                       │    salt rounds)◄──┘    │             │
│   │                       │                        │             │
│   │                       │──── Create user ──────►│             │
│   │                       │◄─── User created ──────│             │
│   │                       │                        │             │
│   │◄── 201 Created ───────│                        │             │
│   │    {user data}        │                        │             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      LOGIN FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User                    API                    Database         │
│   │                       │                        │             │
│   │──── POST /login ─────►│                        │             │
│   │    {email, password}  │                        │             │
│   │                       │                        │             │
│   │                       │──── Find user ────────►│             │
│   │                       │◄─── User data ─────────│             │
│   │                       │                        │             │
│   │                       │── Verify password ─┐   │             │
│   │                       │   (bcrypt.compare) │   │             │
│   │                       │◄──────────────────┘   │             │
│   │                       │                        │             │
│   │                       │── Generate JWT ───┐    │             │
│   │                       │   (1 hour expiry) │    │             │
│   │                       │◄─────────────────┘    │             │
│   │                       │                        │             │
│   │◄── 200 OK ────────────│                        │             │
│   │    {token, user}      │                        │             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                 PROTECTED ROUTE ACCESS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  User                    API                                     │
│   │                       │                                      │
│   │──── GET /api/users ──►│                                      │
│   │    Authorization:     │                                      │
│   │    Bearer <token>     │                                      │
│   │                       │                                      │
│   │                       │── Verify JWT ──┐                     │
│   │                       │                │                     │
│   │                       │◄──────────────┘                     │
│   │                       │                                      │
│   │◄── 200 OK ────────────│  (if valid)                         │
│   │    {protected data}   │                                      │
│   │                       │                                      │
│   │◄── 401/403 Error ─────│  (if invalid/expired)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### API Structure

```
src/
├── app/
│   └── api/
│       ├── auth/
│       │   ├── signup/
│       │   │   └── route.ts     # User registration
│       │   └── login/
│       │       └── route.ts     # User authentication
│       └── users/
│           └── route.ts         # Protected route example
└── lib/
    ├── auth.ts                  # JWT utilities
    └── schemas/
        └── authSchema.ts        # Zod validation schemas
```

---

### Signup API

**Endpoint:** `POST /api/auth/signup`

**Description:** Registers a new user with secure password hashing using bcrypt.

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "SecurePass123",
  "role": "NGO",
  "organizationId": 1
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Signup successful",
  "data": {
    "id": 1,
    "email": "alice@example.com",
    "name": "Alice Johnson",
    "role": "NGO",
    "organizationId": 1,
    "organization": {
      "id": 1,
      "name": "Relief Foundation"
    },
    "createdAt": "2026-01-30T10:00:00.000Z"
  }
}
```

**Error Response - User Exists (400):**
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Error Response - Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation Error",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    }
  ]
}
```

---

### Login API

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user and issues a JWT token.

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "alice@example.com",
      "name": "Alice Johnson",
      "role": "NGO",
      "organizationId": 1,
      "organization": {
        "id": 1,
        "name": "Relief Foundation"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "1h"
  }
}
```

**Error Response - User Not Found (404):**
```json
{
  "success": false,
  "message": "User not found"
}
```

**Error Response - Invalid Credentials (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### Protected Routes

The `/api/users` endpoint is now protected and requires a valid JWT token.

**Request:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [...],
  "timestamp": "2026-01-30T10:00:00.000Z",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**Error Response - Token Missing (401):**
```json
{
  "success": false,
  "message": "Authentication required. Token missing."
}
```

**Error Response - Invalid/Expired Token (403):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

---

### Password Hashing with bcrypt

Passwords are never stored in plain text. Instead, bcrypt creates a one-way hash:

```typescript
import bcrypt from "bcryptjs";

// Hashing a password (during signup)
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

// Verifying a password (during login)
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

**Why bcrypt?**
- **Salt Rounds:** Each hash includes a unique salt, preventing rainbow table attacks
- **Slow by Design:** The algorithm is intentionally slow, making brute-force attacks impractical
- **Industry Standard:** Widely used and battle-tested for password security

---

### JWT Token Generation

JWT tokens encode user identity and are signed with a secret key:

```typescript
import jwt from "jsonwebtoken";

const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  JWT_SECRET,
  { expiresIn: "1h" }
);
```

**Token Structure:**
```
Header.Payload.Signature

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.  <- Header (algorithm)
eyJpZCI6MSwiZW1haWwiOiJhbGljZUBleGFt...  <- Payload (user data)
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV...    <- Signature (verification)
```

---

### Testing the APIs

**1. Signup Request:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "SecurePass123",
    "role": "NGO"
  }'
```

**2. Login Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "SecurePass123"
  }'
```

**3. Access Protected Route:**
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### Security Considerations

#### Token Expiry

| Setting | Value | Rationale |
|---------|-------|-----------|
| Access Token Expiry | 1 hour | Limits exposure if token is compromised |
| Refresh Strategy | Re-login required | Simple and secure for current scope |

#### Token Storage Options

| Method | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **localStorage** | Easy to implement, persists across tabs | Vulnerable to XSS attacks | ❌ Not recommended for sensitive apps |
| **sessionStorage** | Cleared on tab close | Still vulnerable to XSS | ⚠️ Use with caution |
| **HttpOnly Cookie** | Not accessible via JS, immune to XSS | Requires CSRF protection | ✅ Recommended for production |
| **Memory (React State)** | Most secure, no persistence | Lost on page refresh | ✅ Best for high-security apps |

#### Environment Variables

```env
# .env.local
JWT_SECRET=your-super-secret-key-minimum-32-characters
```

**Important:** Never commit secrets to version control. Use environment variables in production.

---

### Reflection: Authentication Best Practices

1. **Password Security:**
   - Never store plain-text passwords
   - Use bcrypt with adequate salt rounds (10+)
   - Enforce strong password policies

2. **Token Management:**
   - Use short expiry times for access tokens
   - Consider refresh tokens for long-lived sessions
   - Invalidate tokens on logout (requires server-side tracking)

3. **Transport Security:**
   - Always use HTTPS in production
   - Set secure cookie flags when using cookies

4. **Error Messages:**
   - Be vague in error responses to prevent user enumeration
   - Consider using generic "Invalid credentials" for both wrong email and password

5. **Rate Limiting:**
   - Implement rate limiting on auth endpoints
   - Prevent brute-force attacks

---

### Summary

| Feature | Implementation |
|---------|----------------|
| Password Hashing | bcrypt (10 salt rounds) |
| Token Type | JWT |
| Token Expiry | 1 hour |
| Auth Routes | `/api/auth/signup`, `/api/auth/login` |
| Protected Route | `/api/users` (GET) |
| Schema Validation | Zod |
| Auth Helper | `src/lib/auth.ts` |

**Result:** The application now has fully functional Signup and Login APIs with secure password hashing, JWT-based authentication, and protected routes that validate tokens before granting access.

---

---

## Lesson 2.21: Authorization Middleware

### Overview

Authorization middleware ensures that authenticated users have appropriate permissions for the actions they're attempting. While **authentication** verifies *who* the user is, **authorization** determines *what* that user is allowed to do.

This lesson implements a reusable middleware system that enforces **Role-Based Access Control (RBAC)** across API routes in the application.

### Key Concepts

| Concept | Description | Example |
|---------|-------------|---------|
| **Authentication** | Confirms user identity | User logs in with valid credentials → JWT issued |
| **Authorization** | Determines what user can do | Only GOVERNMENT users can access `/api/admin` |
| **Roles** | User classifications | `NGO` (organization staff), `GOVERNMENT` (admin staff) |
| **RBAC** | Role-Based Access Control | Different routes require different roles |
| **Least Privilege** | Users only get minimal necessary access | NGO users can't access admin functions |

### User Roles in the Database

The Prisma schema defines two user roles:

```prisma
enum UserRole {
  NGO         // NGO staff members
  GOVERNMENT  // Government officials/admins
}

model User {
  id             Int          @id @default(autoincrement())
  email          String       @unique
  name           String
  passwordHash   String
  role           UserRole     // One of: NGO, GOVERNMENT
  organizationId Int?
  organization   Organization? @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  // ... other fields
}
```

### Middleware Architecture

#### File Location
```
src/
  └── app/
      └── middleware.ts          # Authorization middleware (runs on all API requests)
      └── api/
          ├── admin/
          │   └── route.ts        # GOVERNMENT-only routes
          ├── users/
          │   └── route.ts        # All authenticated users
          ├── auth/
          │   ├── login/route.ts  # Public (no auth required)
          │   └── signup/route.ts # Public (no auth required)
          └── ... other routes (protected)
```

#### Middleware Flow Diagram

```
Incoming Request
    ↓
[Middleware Intercepts]
    ↓
├─ Is route protected? (e.g., /api/users, /api/admin)
│  └─ YES → Continue
│  └─ NO → Skip middleware, allow request
    ↓
├─ Extract Authorization header
│  └─ Token missing? → Return 401 Unauthorized
    ↓
├─ Verify JWT token
│  └─ Invalid/expired? → Return 403 Forbidden
    ↓
├─ Check user role against route requirements
│  ├─ /api/admin → Requires GOVERNMENT role
│  │  └─ User role ≠ GOVERNMENT? → Return 403 Access Denied
│  │  └─ User role = GOVERNMENT? → Continue
│  │
│  └─ Other protected routes → All authenticated users allowed
    ↓
├─ Attach user info to request headers
│  ├─ x-user-id: User ID
│  ├─ x-user-email: User email
│  └─ x-user-role: User role
    ↓
[Route Handler Processes Request]
    ↓
Return Response
```

### Implementation Details

#### 1. Authorization Middleware (`src/app/middleware.ts`)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, extractToken, type DecodedToken } from "@/lib/auth";

// Routes that require authentication
const PROTECTED_ROUTES = ["/api/users", "/api/allocations", "/api/inventory", "/api/organizations"];

// Routes with specific role requirements
const ROLE_BASED_ROUTES: Record<string, string[]> = {
  "/api/admin": ["GOVERNMENT"], // Only GOVERNMENT users
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip non-protected routes
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const requiredRoles = ROLE_BASED_ROUTES[pathname] || null;

  if (!isProtectedRoute && !requiredRoles) {
    return NextResponse.next();
  }

  // Extract and verify token
  const authHeader = req.headers.get("authorization");
  const token = extractToken(authHeader);

  if (!token) {
    return NextResponse.json(
      { success: false, code: "MISSING_TOKEN", message: "Authentication required." },
      { status: 401 }
    );
  }

  const decoded = verifyToken(token) as DecodedToken | null;
  if (!decoded) {
    return NextResponse.json(
      { success: false, code: "INVALID_TOKEN", message: "Invalid or expired token." },
      { status: 403 }
    );
  }

  // Check role-based access
  if (requiredRoles && !requiredRoles.includes(decoded.role)) {
    return NextResponse.json(
      {
        success: false,
        code: "INSUFFICIENT_PERMISSIONS",
        message: `Access denied. Requires: ${requiredRoles.join(", ")}`,
      },
      { status: 403 }
    );
  }

  // Pass user info to route handlers via headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", decoded.id.toString());
  requestHeaders.set("x-user-email", decoded.email);
  requestHeaders.set("x-user-role", decoded.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/api/:path*"],
};
```

**Key Features:**
- Validates JWT tokens from Authorization headers
- Enforces role-based access control for protected routes
- Passes authenticated user information via custom headers
- Returns appropriate error codes for different failure scenarios

#### 2. Protected Admin Route (`src/app/api/admin/route.ts`)

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin Route - GOVERNMENT USERS ONLY
 * The middleware validates that the user has the GOVERNMENT role before
 * this handler is executed.
 */
export async function GET(req: NextRequest) {
  // Retrieve authenticated user info from middleware
  const userId = req.headers.get("x-user-id");
  const userEmail = req.headers.get("x-user-email");
  const userRole = req.headers.get("x-user-role");

  return NextResponse.json(
    {
      success: true,
      message: "Welcome to the Admin Dashboard! You have full access.",
      data: {
        accessLevel: "ADMIN",
        permissions: [
          "view_all_users",
          "view_all_organizations",
          "view_all_allocations",
          "approve_allocations",
          "manage_roles",
          "view_system_stats",
        ],
        authenticatedUser: {
          id: userId,
          email: userEmail,
          role: userRole,
        },
      },
    },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const userEmail = req.headers.get("x-user-email");
  const body = await req.json().catch(() => ({}));

  return NextResponse.json(
    {
      success: true,
      message: "Admin action executed successfully",
      data: {
        action: body.action || "unknown",
        performedBy: { id: userId, email: userEmail },
        timestamp: new Date().toISOString(),
      },
    },
    { status: 201 }
  );
}
```

#### 3. Protected User Route (`src/app/api/users/route.ts`)

```typescript
/**
 * GET /api/users
 * PROTECTED ROUTE - All authenticated users can access
 * Middleware validates JWT and passes user info via headers
 */
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const userRole = req.headers.get("x-user-role");

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;

  // Fetch users with pagination
  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip: (page - 1) * limit, take: limit }),
    prisma.user.count(),
  ]);

  return sendSuccess(users, "Users retrieved successfully", 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    requestedBy: { userId, userRole },
  });
}
```

### Testing Authorization

#### Setup: Generate Test Tokens

First, generate JWT tokens for testing. You can use the signup/login endpoints:

**1. Create a GOVERNMENT user**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123",
    "name": "Admin User",
    "role": "GOVERNMENT"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": { "id": 1, "email": "admin@example.com", "role": "GOVERNMENT" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Save the token: `ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

**2. Create an NGO user**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ngo@example.com",
    "password": "SecurePass123",
    "name": "NGO User",
    "role": "NGO"
  }'
```

Save the token: `NGO_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

#### Test 1: Admin Route Access (GOVERNMENT User)

**Request:**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Welcome to the Admin Dashboard! You have full access.",
  "data": {
    "accessLevel": "ADMIN",
    "permissions": [
      "view_all_users",
      "view_all_organizations",
      "view_all_allocations",
      "approve_allocations",
      "manage_roles",
      "view_system_stats"
    ],
    "authenticatedUser": {
      "id": "1",
      "email": "admin@example.com",
      "role": "GOVERNMENT"
    }
  }
}
```

**Status:** ✅ **ALLOWED** - GOVERNMENT user successfully accessed admin route

---

#### Test 2: Admin Route Access (NGO User - Should Fail)

**Request:**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer $NGO_TOKEN"
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "code": "INSUFFICIENT_PERMISSIONS",
  "message": "Access denied. This endpoint requires one of the following roles: GOVERNMENT. Your role: NGO"
}
```

**Status:** ❌ **DENIED** - NGO user correctly blocked from admin route

---

#### Test 3: Protected User Route (GOVERNMENT User)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "GOVERNMENT",
      "createdAt": "2026-01-30T10:00:00Z"
    },
    {
      "id": 2,
      "email": "ngo@example.com",
      "name": "NGO User",
      "role": "NGO",
      "createdAt": "2026-01-30T10:05:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1,
    "requestedBy": { "userId": "1", "userRole": "GOVERNMENT" }
  }
}
```

**Status:** ✅ **ALLOWED** - All authenticated users can access user list

---

#### Test 4: Protected User Route (NGO User)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer $NGO_TOKEN"
```

**Expected Response (200 OK):**
Same structure as Test 3, with `userId: "2"` and `userRole: "NGO"`

**Status:** ✅ **ALLOWED** - NGO user can also access user list

---

#### Test 5: Missing Authentication Token

**Request:**
```bash
curl -X GET http://localhost:3000/api/admin
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "code": "MISSING_TOKEN",
  "message": "Authentication required. Please provide a valid token."
}
```

**Status:** ❌ **DENIED** - No authentication provided

---

#### Test 6: Invalid/Expired Token

**Request:**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer invalid.token.here"
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "code": "INVALID_TOKEN",
  "message": "Invalid or expired token. Please authenticate again."
}
```

**Status:** ❌ **DENIED** - Token invalid or expired

---

### Access Control Matrix

| Route | GOVERNMENT | NGO | Unauthenticated |
|-------|:----------:|:---:|:---------------:|
| `/api/admin` (GET) | ✅ **Allow** | ❌ **Deny (403)** | ❌ **Deny (401)** |
| `/api/admin` (POST) | ✅ **Allow** | ❌ **Deny (403)** | ❌ **Deny (401)** |
| `/api/users` (GET) | ✅ **Allow** | ✅ **Allow** | ❌ **Deny (401)** |
| `/api/users` (POST) | ✅ **Allow** | ✅ **Allow** | ❌ **Deny (401)** |
| `/api/auth/login` | ✅ **Allow** | ✅ **Allow** | ✅ **Allow** |
| `/api/auth/signup` | ✅ **Allow** | ✅ **Allow** | ✅ **Allow** |

### Security Best Practices Implemented

#### 1. JWT Verification
- Every protected route requires a valid, non-expired JWT
- Invalid tokens result in 403 Forbidden responses
- Token expiry enforces re-authentication

#### 2. Role-Based Access Control (RBAC)
- Routes are protected with specific role requirements
- Users cannot elevate their own privileges
- Admin functions are restricted to GOVERNMENT users

#### 3. Least Privilege Principle
- Users only get access to routes necessary for their role
- NGO users cannot access admin functions
- Default deny: only explicitly allowed routes are accessible

#### 4. Request Context Preservation
- Authenticated user info is passed via custom headers
- Route handlers know who made the request and their role
- Enables audit logging and request-level authorization

#### 5. Error Handling
- Generic error messages prevent information leakage
- Distinct error codes for different failure modes:
  - `MISSING_TOKEN` (401): No authentication provided
  - `INVALID_TOKEN` (403): Token verification failed
  - `INSUFFICIENT_PERMISSIONS` (403): User role insufficient for route

### Extending Authorization

#### Adding New Roles

To add a new role (e.g., "MODERATOR"):

1. **Update Prisma schema:**
```prisma
enum UserRole {
  NGO
  GOVERNMENT
  MODERATOR  // New role
}
```

2. **Run migration:**
```bash
npx prisma migrate dev --name add_moderator_role
```

3. **Add role-based routes in middleware:**
```typescript
const ROLE_BASED_ROUTES: Record<string, string[]> = {
  "/api/admin": ["GOVERNMENT"],
  "/api/reports": ["GOVERNMENT", "MODERATOR"],  // Moderators can view reports
};
```

#### Adding New Protected Routes

To protect a new route:

1. **Add to PROTECTED_ROUTES or ROLE_BASED_ROUTES:**
```typescript
// For routes all authenticated users can access:
const PROTECTED_ROUTES = ["/api/users", "/api/new-route"];

// For routes with specific roles:
const ROLE_BASED_ROUTES = {
  "/api/admin": ["GOVERNMENT"],
  "/api/moderator": ["GOVERNMENT", "MODERATOR"],
};
```

2. **Implement route handler:**
```typescript
export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  const userRole = req.headers.get("x-user-role");
  // ... route logic
}
```

### Summary

| Aspect | Implementation |
|--------|----------------|
| **Middleware File** | `src/app/middleware.ts` |
| **Protected Routes** | `/api/users/*`, `/api/admin/*`, `/api/allocations/*`, `/api/inventory/*`, `/api/organizations/*` |
| **Admin-Only Routes** | `/api/admin` |
| **Public Routes** | `/api/auth/login`, `/api/auth/signup` |
| **User Roles** | `NGO`, `GOVERNMENT` |
| **Token Type** | JWT (Bearer token in Authorization header) |
| **Token Validation** | Middleware intercepts all requests |
| **Error Codes** | `MISSING_TOKEN`, `INVALID_TOKEN`, `INSUFFICIENT_PERMISSIONS` |
| **Access Control** | Role-based (RBAC) with least privilege principle |

### Result

✅ **Authorization middleware successfully implemented:**
- JWT validation on all protected routes
- Role-based access control enforced
- GOVERNMENT users can access admin routes
- NGO users restricted from admin functions
- Authenticated user context preserved for request handlers
- Extensible design for adding new roles and routes

---

## 2.22 Error Handling Middleware

### Overview

A **centralized error handling system** has been implemented to ensure consistent, structured error handling across all API endpoints. This system:

1. **Catches and categorizes errors** by type (validation, database, authentication, authorization)
2. **Logs detailed information** for debugging while hiding sensitive data in production
3. **Provides safe, user-friendly responses** without exposing implementation details
4. **Maintains structured logs** for monitoring and observability

### Why Centralized Error Handling Matters

Without centralized error handling:
- ❌ Errors are scattered across routes with inconsistent formats
- ❌ Sensitive stack traces expose implementation details in production
- ❌ Logs are unstructured, making debugging difficult
- ❌ Inconsistent user-facing messages reduce trust

With centralized error handling:
- ✅ Every error follows a uniform response format
- ✅ Sensitive data is redacted in production
- ✅ Structured logs make debugging and monitoring easier
- ✅ Consistent, user-friendly error messages build trust

### Implementation Files

#### 1. **Logger Utility** (`src/lib/logger.ts`)

Provides structured logging with JSON formatting:

```typescript
export const logger = {
  info: (message: string, meta?: any) => {
    console.log(JSON.stringify({ level: "info", message, meta, timestamp: new Date() }));
  },
  error: (message: string, meta?: any) => {
    console.error(JSON.stringify({ level: "error", message, meta, timestamp: new Date() }));
  },
  warn: (message: string, meta?: any) => {
    console.warn(JSON.stringify({ level: "warn", message, meta, timestamp: new Date() }));
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(JSON.stringify({ level: "debug", message, meta, timestamp: new Date() }));
    }
  },
};
```

**Usage:**
```typescript
logger.info("User login successful", { userId: "123", email: "user@example.com" });
logger.error("Database connection failed", { error: error.message });
```

#### 2. **Error Handler** (`src/lib/errorHandler.ts`)

Centralized error handler that categorizes errors and provides environment-appropriate responses:

```typescript
export enum ErrorType {
  VALIDATION = "VALIDATION_ERROR",
  AUTHENTICATION = "AUTHENTICATION_ERROR",
  AUTHORIZATION = "AUTHORIZATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  DATABASE = "DATABASE_ERROR",
  INTERNAL = "INTERNAL_ERROR",
}

// Main error handler
export function handleError(error: any, errorContext: ErrorContext) {
  const isDev = process.env.NODE_ENV === "development";
  
  // Log full details
  logger.error(`Error in ${context}`, {
    type,
    message: errorMessage,
    stack: isDev ? errorStack : "REDACTED",
    statusCode,
  });

  // Return safe response based on environment
  return NextResponse.json({
    success: false,
    message: getUserMessage(type, isDev ? errorMessage : undefined),
    errorCode: type,
    ...(isDev && { stack: errorStack }),
  }, { status: statusCode });
}
```

**Convenience Methods:**
```typescript
handleDatabaseError(error, "GET /api/users")
handleValidationError(error, "POST /api/users")
handleAuthError(error, "POST /api/auth/login")
handleAuthorizationError(error, "GET /api/admin")
```

### API Route Integration

All API routes have been updated to use the centralized error handler:

#### Example: `src/app/api/users/route.ts`

```typescript
import { handleDatabaseError, handleValidationError } from "@/lib/errorHandler";
import { ZodError } from "zod";

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany();
    return sendSuccess(users, "Users retrieved successfully");
  } catch (error) {
    return handleDatabaseError(error, "GET /api/users");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createUserSchema.parse(body);
    // ... create user
    return createSuccessResponse("User created successfully", user, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleValidationError(error, "POST /api/users");
    }
    return handleDatabaseError(error, "POST /api/users");
  }
}
```

**Updated Routes:**
- ✅ `src/app/api/users/route.ts`
- ✅ `src/app/api/allocations/route.ts`
- ✅ `src/app/api/inventory/route.ts`
- ✅ `src/app/api/organizations/route.ts`

### Error Response Behavior

#### Development Environment

**Request:**
```bash
curl -X GET http://localhost:3000/api/users
```

**Response (with stack trace):**
```json
{
  "success": false,
  "message": "Database connection failed",
  "errorCode": "DATABASE_ERROR",
  "stack": "Error: Database connection failed\n    at async GET (file://...)\n    at async ..."
}
```

**Console Log:**
```json
{
  "level": "error",
  "message": "Error in GET /api/users",
  "meta": {
    "type": "DATABASE_ERROR",
    "message": "Database connection failed",
    "stack": "Error: Database connection failed\n    at async GET ...",
    "statusCode": 500
  },
  "timestamp": "2025-01-30T10:30:00.000Z"
}
```

#### Production Environment

**Request:**
```bash
curl -X GET https://api.example.com/users
```

**Response (sanitized):**
```json
{
  "success": false,
  "message": "A database error occurred. Please try again later.",
  "errorCode": "DATABASE_ERROR"
}
```

**Console Log (Internal):**
```json
{
  "level": "error",
  "message": "Error in GET /api/users",
  "meta": {
    "type": "DATABASE_ERROR",
    "message": "Database connection failed",
    "stack": "REDACTED",
    "statusCode": 500
  },
  "timestamp": "2025-01-30T10:30:00.000Z"
}
```

### Error Types and HTTP Status Codes

| Error Type | HTTP Status | User Message (Dev) | User Message (Prod) |
|------------|-------------|--------------------|---------------------|
| `VALIDATION_ERROR` | 400 | Actual validation error details | "Invalid request data. Please check your input." |
| `AUTHENTICATION_ERROR` | 401 | Actual auth error | "Authentication failed. Please try logging in again." |
| `AUTHORIZATION_ERROR` | 403 | Actual auth error | "You do not have permission to perform this action." |
| `NOT_FOUND` | 404 | Actual not found message | "The requested resource was not found." |
| `CONFLICT` | 409 | Actual conflict message | "A conflict occurred. The resource may already exist." |
| `DATABASE_ERROR` | 500 | Actual database error | "A database error occurred. Please try again later." |
| `INTERNAL_ERROR` | 500 | Actual error message | "Something went wrong. Please try again later." |

### Structured Logging Format

All logs follow a consistent JSON structure:

```json
{
  "level": "info|error|warn|debug",
  "message": "Human-readable message",
  "meta": {
    "key1": "value1",
    "key2": "value2"
  },
  "timestamp": "2025-01-30T10:30:00.000Z"
}
```

**Benefits:**
- 🔍 **Searchable**: Filter logs by level, message, or metadata keys
- 📊 **Parseable**: Easily processed by log aggregation services (CloudWatch, DataDog, etc.)
- 🎯 **Contextual**: Includes relevant metadata for debugging
- ⏰ **Traceable**: Timestamp helps correlate events

### Configuration

**Environment Variables:**

```env
# Development
NODE_ENV=development

# Production
NODE_ENV=production
```

The error handler automatically adjusts behavior based on `NODE_ENV`:
- **development**: Shows full stack traces and detailed error messages
- **production**: Redacts stack traces and shows generic messages

### Debugging Tips

1. **Check Development Logs**: Full error details are shown in development mode
```bash
npm run dev
# Check console output for detailed error messages and stack traces
```

2. **Monitor Production Logs**: Use structured logging for production debugging
```bash
# Example: Query logs for database errors
cat logs/* | grep -i "DATABASE_ERROR"

# Or with a log aggregation service like CloudWatch
aws logs filter-log-events --log-group-name /api/errors --filter-pattern "DATABASE_ERROR"
```

3. **Trace Request Context**: Each error log includes the route context
```json
{
  "message": "Error in GET /api/users",
  // Makes it easy to see which endpoint failed
}
```

### Reflection: Why This Matters

#### Security
- 🔐 **Protects Implementation Details**: Stack traces and database errors are hidden from users
- 🔐 **Reduces Attack Surface**: Attackers can't use error messages to discover system structure
- 🔐 **Builds User Trust**: Users see professional, safe error messages

#### Observability
- 📊 **Centralized Insights**: One place to see all error patterns
- 📊 **Easy Debugging**: Structured logs make it trivial to find and fix issues
- 📊 **Proactive Monitoring**: Can set alerts on error types and rates

#### Extensibility
- 🔧 **Easy to Extend**: Adding new error types or custom handlers is straightforward
- 🔧 **Supports Multiple Environments**: Different behavior for dev vs. prod
- 🔧 **Integration-Ready**: Works with any logging service (File, CloudWatch, DataDog, etc.)

### Summary Table

| Feature | Implementation | Benefit |
|---------|-----------------|---------|
| **Centralized Handler** | Single `handleError()` function | Consistency across all routes |
| **Structured Logging** | JSON logs with metadata | Searchable, filterable logs |
| **Environment Awareness** | Dev mode shows details, Prod hides them | Security + Debuggability |
| **Error Categorization** | 7 error types with specific status codes | Clear error semantics |
| **Validation Handling** | Special handler for Zod errors | Better validation feedback |
| **Database Errors** | Dedicated handler for database issues | Easy to monitor DB problems |

### Result

✅ **Centralized error handling successfully implemented:**
- All API routes use the centralized error handler
- Consistent response format across all endpoints
- Full stack traces in development, redacted in production
- Structured JSON logging for all errors
- User-safe error messages in production
- Type-safe error categorization with enums
- Easy to extend with new error types
- Database errors handled separately for better monitoring
- Validation errors (Zod) handled with detailed field information
````