# Authorization Middleware Testing Guide

This document provides step-by-step instructions for testing the authorization middleware and access control system.

## Prerequisites

- Application running locally on `http://localhost:3000`
- `curl` or Postman for making HTTP requests
- PostgreSQL database with migrations applied

## Step 1: Generate Test Tokens

### Create a GOVERNMENT User

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

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "GOVERNMENT",
      "createdAt": "2026-01-30T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJHT1ZFUk5NRU5UIiwiaWF0IjoxNjc0NTk3MjAwLCJleHAiOjE2NzQ2MDA4MDB9.3xK7Qw9..."
  }
}
```

**Save the token:**
```bash
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJHT1ZFUk5NRU5UIiwiaWF0IjoxNjc0NTk3MjAwLCJleHAiOjE2NzQ2MDA4MDB9.3xK7Qw9..."
```

---

### Create an NGO User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ngo@example.com",
    "password": "SecurePass456",
    "name": "NGO User",
    "role": "NGO"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 2,
      "email": "ngo@example.com",
      "name": "NGO User",
      "role": "NGO",
      "createdAt": "2026-01-30T10:05:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJuZ29AZXhhbXBsZS5jb20iLCJyb2xlIjoiTkdPIiwiaWF0IjoxNjc0NTk3NTAwLCJleHAiOjE2NzQ2MDExMDB9.7mL8Rs2..."
  }
}
```

**Save the token:**
```bash
NGO_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJuZ29AZXhhbXBsZS5jb20iLCJyb2xlIjoiTkdPIiwiaWF0IjoxNjc0NTk3NTAwLCJleHAiOjE2NzQ2MDExMDB9.7mL8Rs2..."
```

---

## Step 2: Test Access Control

### Test 2.1: GOVERNMENT User Accessing `/api/admin` (Should Succeed)

**Request:**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
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

**Result:** ✅ **SUCCESS** - GOVERNMENT user can access admin routes
- HTTP Status: 200 OK
- User role matches required role (GOVERNMENT)
- Access granted with full admin permissions

---

### Test 2.2: NGO User Accessing `/api/admin` (Should Fail)

**Request:**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer $NGO_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "code": "INSUFFICIENT_PERMISSIONS",
  "message": "Access denied. This endpoint requires one of the following roles: GOVERNMENT. Your role: NGO"
}
```

**Result:** ❌ **BLOCKED** - NGO user correctly denied access
- HTTP Status: 403 Forbidden
- User role (NGO) does not match required role (GOVERNMENT)
- Middleware enforces least privilege principle

---

### Test 2.3: Missing Token Accessing `/api/admin`

**Request:**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Content-Type: application/json"
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "code": "MISSING_TOKEN",
  "message": "Authentication required. Please provide a valid token."
}
```

**Result:** ❌ **BLOCKED** - No authentication provided
- HTTP Status: 401 Unauthorized
- No Authorization header in request
- User must authenticate before accessing protected routes

---

### Test 2.4: Invalid Token Accessing `/api/admin`

**Request:**
```bash
curl -X GET http://localhost:3000/api/admin \
  -H "Authorization: Bearer invalid.token.here" \
  -H "Content-Type: application/json"
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "code": "INVALID_TOKEN",
  "message": "Invalid or expired token. Please authenticate again."
}
```

**Result:** ❌ **BLOCKED** - Token invalid or corrupted
- HTTP Status: 403 Forbidden
- JWT verification failed (signature invalid)
- User must provide valid token

---

## Step 3: Test Protected General Routes

### Test 3.1: GOVERNMENT User Accessing `/api/users` (Should Succeed)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json"
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
      "organizationId": null,
      "organization": null,
      "createdAt": "2026-01-30T10:00:00Z"
    },
    {
      "id": 2,
      "email": "ngo@example.com",
      "name": "NGO User",
      "role": "NGO",
      "organizationId": null,
      "organization": null,
      "createdAt": "2026-01-30T10:05:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1,
    "requestedBy": {
      "userId": "1",
      "userRole": "GOVERNMENT",
      "userEmail": "admin@example.com"
    }
  }
}
```

**Result:** ✅ **SUCCESS** - GOVERNMENT user can access user listing
- HTTP Status: 200 OK
- All authenticated users can access this route
- Request includes user context in response

---

### Test 3.2: NGO User Accessing `/api/users` (Should Succeed)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer $NGO_TOKEN" \
  -H "Content-Type: application/json"
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
      "organizationId": null,
      "organization": null,
      "createdAt": "2026-01-30T10:00:00Z"
    },
    {
      "id": 2,
      "email": "ngo@example.com",
      "name": "NGO User",
      "role": "NGO",
      "organizationId": null,
      "organization": null,
      "createdAt": "2026-01-30T10:05:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1,
    "requestedBy": {
      "userId": "2",
      "userRole": "NGO",
      "userEmail": "ngo@example.com"
    }
  }
}
```

**Result:** ✅ **SUCCESS** - NGO user can also access user listing
- HTTP Status: 200 OK
- Both NGO and GOVERNMENT users have access to general endpoints
- Request metadata correctly identifies the NGO user

---

### Test 3.3: Unauthenticated Access to `/api/users` (Should Fail)

**Request:**
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Expected Response (401 Unauthorized):**
```json
{
  "success": false,
  "code": "MISSING_TOKEN",
  "message": "Authentication required. Please provide a valid token."
}
```

**Result:** ❌ **BLOCKED** - Unauthenticated users cannot access protected routes
- HTTP Status: 401 Unauthorized
- All protected routes require valid authentication
- Consistent security across all endpoints

---

## Step 4: Test Admin Route POST Handler

### Test 4.1: Admin POST Request (GOVERNMENT User)

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve_allocation",
    "allocationId": 42
  }'
```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Admin action executed successfully",
  "data": {
    "action": "approve_allocation",
    "performedBy": {
      "id": "1",
      "email": "admin@example.com"
    },
    "timestamp": "2026-01-30T10:15:30.123Z"
  }
}
```

**Result:** ✅ **SUCCESS** - Admin action accepted
- HTTP Status: 201 Created
- GOVERNMENT user can perform administrative actions
- Request is logged with user context

---

### Test 4.2: Admin POST Request (NGO User - Should Fail)

**Request:**
```bash
curl -X POST http://localhost:3000/api/admin \
  -H "Authorization: Bearer $NGO_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "approve_allocation",
    "allocationId": 42
  }'
```

**Expected Response (403 Forbidden):**
```json
{
  "success": false,
  "code": "INSUFFICIENT_PERMISSIONS",
  "message": "Access denied. This endpoint requires one of the following roles: GOVERNMENT. Your role: NGO"
}
```

**Result:** ❌ **BLOCKED** - NGO cannot perform admin actions
- HTTP Status: 403 Forbidden
- Request rejected before reaching route handler
- Middleware enforces access control for all HTTP methods

---

## Test Summary

### Access Control Results

| Route | Method | GOVERNMENT | NGO | Unauthenticated |
|-------|--------|:----------:|:---:|:---------------:|
| `/api/admin` | GET | ✅ (200) | ❌ (403) | ❌ (401) |
| `/api/admin` | POST | ✅ (201) | ❌ (403) | ❌ (401) |
| `/api/users` | GET | ✅ (200) | ✅ (200) | ❌ (401) |
| `/api/users` | POST | ✅ (201) | ✅ (201) | ❌ (401) |

### Error Code Reference

| Code | Status | Meaning | Resolution |
|------|--------|---------|-----------|
| `MISSING_TOKEN` | 401 | No Authorization header provided | Add `Authorization: Bearer <token>` header |
| `INVALID_TOKEN` | 403 | JWT signature invalid or expired | Login again to get a fresh token |
| `INSUFFICIENT_PERMISSIONS` | 403 | User role doesn't match route requirements | Use account with appropriate role |

### Key Observations

1. **Role-Based Enforcement:** Middleware correctly validates roles before handlers execute
2. **Consistent Security:** All protected routes enforce same authentication requirements
3. **Least Privilege:** NGO users cannot escalate to admin functions
4. **Error Clarity:** Different error codes help clients understand failure reasons
5. **Context Preservation:** Request headers pass user info to route handlers for logging/auditing

---

## Troubleshooting

### Token Expired?

If you receive "Invalid or expired token" error, generate a new token:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePass123"
  }'
```

### Wrong Role?

Verify your user's role matches the route requirement:
```bash
# Check which role a user has
curl -X GET "http://localhost:3000/api/users?page=1" \
  -H "Authorization: Bearer $YOUR_TOKEN"
# Look at the "authenticatedUser" in the response
```

### Still Getting 401?

1. Verify token is not expired (tokens expire in 1 hour)
2. Check Authorization header format: `Bearer <token>` (space between "Bearer" and token)
3. Ensure token is from the same environment (localhost:3000)

---

## Postman Collection (Optional)

You can import the following curl requests into Postman for easier testing:

1. **Create GOVERNMENT User** → Save token as `ADMIN_TOKEN`
2. **Create NGO User** → Save token as `NGO_TOKEN`
3. **Test 2.1**: GOVERNMENT accessing `/api/admin`
4. **Test 2.2**: NGO accessing `/api/admin`
5. **Test 3.1**: GOVERNMENT accessing `/api/users`
6. **Test 3.2**: NGO accessing `/api/users`

Each request can be saved with the token in the Authorization header using Postman's pre-request scripts or environment variables.
