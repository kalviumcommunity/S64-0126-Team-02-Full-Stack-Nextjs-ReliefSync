# Role-Based Access Control (RBAC) Design & Extensibility

## Current Implementation

### User Roles

The application currently supports two user roles defined in the Prisma schema:

```prisma
enum UserRole {
  NGO         // NGO staff members - can view and manage allocations for their organization
  GOVERNMENT  // Government officials - can approve, manage, and view all allocations system-wide
}
```

### Permission Matrix (Current)

| Permission | NGO | GOVERNMENT |
|------------|:---:|:----------:|
| View own organization data | ✅ | ✅ |
| View all users | ✅ | ✅ |
| Create allocations | ✅ | ✅ |
| Approve allocations | ❌ | ✅ |
| Manage system settings | ❌ | ✅ |
| View all allocations | ✅ | ✅ |
| Create users | ✅ | ✅ |

## Route Protection Strategy

### Protected Routes by Role

```typescript
const ROLE_BASED_ROUTES: Record<string, string[]> = {
  "/api/admin": ["GOVERNMENT"],                    // Admin-only
  "/api/allocations/approve": ["GOVERNMENT"],      // Approval workflow
  "/api/organizations/manage": ["GOVERNMENT"],     // System management
};

const PROTECTED_ROUTES = [
  "/api/users",                  // All authenticated users
  "/api/allocations",            // All authenticated users
  "/api/inventory",              // All authenticated users
  "/api/organizations",          // All authenticated users
];
```

### Middleware Authorization Logic

```
Incoming Request
    ↓
Route matches PROTECTED_ROUTES?
    ├─ YES → Require authentication (all roles allowed)
    └─ NO → Check ROLE_BASED_ROUTES
             ↓
         Route requires specific role?
             ├─ YES → Validate role, allow only matching roles
             └─ NO → Allow request (public route)
```

## Extending Roles: Step-by-Step Guide

### Scenario: Adding a "MODERATOR" Role

**Goal:** Create a moderator role that can:
- View all allocations
- Approve allocations (same as GOVERNMENT)
- BUT cannot manage user accounts or system settings

---

#### Step 1: Update Prisma Schema

**File:** `prisma/schema.prisma`

```prisma
enum UserRole {
  NGO         // NGO staff members
  GOVERNMENT  // Government officials/admins
  MODERATOR   // NEW: Content and allocation moderators
}

model User {
  // ... existing fields ...
  role       UserRole      // Updated to include MODERATOR
}
```

---

#### Step 2: Create Database Migration

```bash
# Generate migration for new role
npx prisma migrate dev --name add_moderator_role

# Enter migration name when prompted:
# "add_moderator_role"
```

**Generated migration file:** `prisma/migrations/[timestamp]_add_moderator_role/migration.sql`

```sql
-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MODERATOR';
```

---

#### Step 3: Update Middleware Configuration

**File:** `src/app/middleware.ts`

Update role-based routes to include MODERATOR:

```typescript
const ROLE_BASED_ROUTES: Record<string, string[]> = {
  // Admin dashboard - GOVERNMENT only
  "/api/admin": ["GOVERNMENT"],
  
  // Allocation approval - GOVERNMENT and MODERATOR
  "/api/allocations/approve": ["GOVERNMENT", "MODERATOR"],
  
  // System management - GOVERNMENT only (moderators cannot change system settings)
  "/api/organizations/manage": ["GOVERNMENT"],
  "/api/users/roles": ["GOVERNMENT"],
};

// Routes accessible to all authenticated users remain in PROTECTED_ROUTES
const PROTECTED_ROUTES = [
  "/api/users",
  "/api/allocations",
  "/api/inventory",
  "/api/organizations",
];
```

---

#### Step 4: Create Moderator-Specific Routes (Optional)

**File:** `src/app/api/moderator/route.ts`

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Moderator Dashboard
 * Accessible to: MODERATOR, GOVERNMENT
 * Restricted to: NGO
 */
export async function GET(req: NextRequest) {
  const userRole = req.headers.get("x-user-role");
  
  // Could add additional role check here if needed
  // (middleware already validates this)
  
  return NextResponse.json(
    {
      success: true,
      message: "Welcome to Moderator Dashboard",
      data: {
        accessLevel: "MODERATOR",
        permissions: [
          "view_pending_allocations",
          "approve_allocations",
          "reject_allocations",
          "view_allocation_history",
          "generate_moderation_reports",
        ],
        authenticatedUser: {
          role: userRole,
        },
      },
    },
    { status: 200 }
  );
}
```

Add to middleware route config:

```typescript
const ROLE_BASED_ROUTES: Record<string, string[]> = {
  // ... existing routes ...
  "/api/moderator": ["GOVERNMENT", "MODERATOR"],  // NEW
};
```

---

#### Step 5: Update Tests

**File:** `docs/AUTHORIZATION_TESTING.md`

Add test for MODERATOR user:

```bash
# Create MODERATOR user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "moderator@example.com",
    "password": "SecurePass789",
    "name": "Moderator User",
    "role": "MODERATOR"
  }'

# Test moderator accessing approval endpoint
curl -X GET http://localhost:3000/api/allocations/approve \
  -H "Authorization: Bearer $MODERATOR_TOKEN"
# Expected: 200 OK (allowed)

# Test moderator accessing admin settings (should fail)
curl -X GET http://localhost:3000/api/organizations/manage \
  -H "Authorization: Bearer $MODERATOR_TOKEN"
# Expected: 403 Forbidden (insufficient permissions)
```

---

## Multi-Tier Role System: Advanced Example

### Enterprise Scenario: Hierarchical Roles

```prisma
enum UserRole {
  // Basic roles
  USER          // Regular user - read-only access
  
  // Organization roles
  ORG_STAFF     // NGO staff - can manage org data
  ORG_MANAGER   // NGO manager - can approve org requests
  
  // Government roles
  OFFICER       // Government officer - can view allocations
  COORDINATOR   // Government coordinator - can approve allocations
  ADMIN         // Government admin - full system access
}
```

### Permission Hierarchy

```typescript
const ROLE_HIERARCHY = {
  "USER": [],
  "ORG_STAFF": ["user"],
  "ORG_MANAGER": ["org_staff", "user"],
  "OFFICER": ["user"],
  "COORDINATOR": ["officer", "user"],
  "ADMIN": ["all"],
};

// In middleware, check if user's role is in allowed hierarchy
function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole) || 
         ROLE_HIERARCHY[userRole]?.some(r => requiredRoles.includes(r));
}
```

---

## Dynamic Permission System (Future Enhancement)

### Concept: Role-Permission Mapping Table

Instead of hardcoding roles in middleware, store in database:

```prisma
model Role {
  id          Int         @id @default(autoincrement())
  name        String      @unique
  description String?
  
  permissions Permission[]
  users       User[]
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Permission {
  id      Int     @id @default(autoincrement())
  name    String  @unique      // e.g., "view_users", "approve_allocation"
  
  roles   Role[]
  
  createdAt DateTime @default(now())
}

model User {
  // ... existing fields ...
  roleId    Int
  role      Role      @relation(fields: [roleId], references: [id])
}
```

### Benefits

✅ Add roles without code changes  
✅ Modify permissions dynamically  
✅ More flexible for enterprise systems  
✅ Audit trail of permission changes  

---

## Best Practices for Role Extension

### 1. **Principle of Least Privilege**

Always grant minimum necessary permissions:

```typescript
// ❌ WRONG: Giving too much access
"/api/allocations/*": ["NGO"]  // NGO shouldn't modify all allocations

// ✅ CORRECT: Specific endpoints with minimal access
"/api/allocations/create": ["NGO"],        // Can only create own
"/api/allocations/:id/edit": ["NGO"],      // Can only edit own
"/api/allocations/:id/approve": ["GOVERNMENT"],  // Government approves
```

---

### 2. **Role Naming Convention**

Use clear, verb-noun combinations:

```
ORG_STAFF       // Staff member of an organization
ORG_MANAGER     // Manages organizational operations
GOVERNMENT      // Government user (general)
GOV_OFFICER     // Specific government officer role
GOV_ADMIN       // Government system administrator
```

---

### 3. **Document Role Permissions**

Keep a clear matrix in your codebase:

```typescript
/**
 * Role Permission Matrix
 * 
 * Route                    | NGO | ORG_MANAGER | OFFICER | GOVERNMENT
 * ------                   | --- | ----------- | ------- | ----------
 * /api/users               | ✅  | ✅          | ✅      | ✅
 * /api/allocations         | ✅  | ✅          | ✅      | ✅
 * /api/allocations/approve | ❌  | ✅          | ❌      | ✅
 * /api/admin               | ❌  | ❌          | ❌      | ✅
 */
```

---

### 4. **Test All Role Combinations**

```typescript
// Test matrix for each new route
const testCases = [
  { route: "/api/admin", role: "GOVERNMENT", expected: 200 },
  { route: "/api/admin", role: "NGO", expected: 403 },
  { route: "/api/admin", role: "MODERATOR", expected: 403 },
];

for (const testCase of testCases) {
  // Run test with respective role
}
```

---

### 5. **Monitor Permission Escalation**

Add logging for permission-denied requests:

```typescript
// In middleware - log access denied attempts
if (requiredRoles && !requiredRoles.includes(decoded.role)) {
  console.warn(
    `[SECURITY] Access denied: User ${decoded.email} (${decoded.role}) ` +
    `attempted to access ${pathname} (requires: ${requiredRoles.join(", ")})`
  );
  // Consider alerting admins if this happens frequently
}
```

---

## Summary

| Aspect | Current | Extensible? |
|--------|---------|------------|
| Roles | 2 (NGO, GOVERNMENT) | ✅ Yes |
| Role Storage | Prisma enum | ✅ Can migrate to table |
| Permission Definition | Code (middleware) | ✅ Can move to database |
| Hierarchy | Flat | ✅ Can implement hierarchy |
| Audit Trail | None | ✅ Can add logging |
| Dynamic Updates | No | ✅ Possible with DB-backed roles |

**Recommendation:** Keep current flat role structure for MVP. Migrate to database-backed roles if you need to:
- Add/remove roles without deployment
- Track permission change history
- Support complex hierarchies
- Enable per-organization role customization
