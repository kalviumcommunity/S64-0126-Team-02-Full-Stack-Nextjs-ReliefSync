# Error Handling Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     API Route Handler                        │
│  (e.g., src/app/api/users/route.ts)                         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ try { ... } catch(error)
                 ▼
┌─────────────────────────────────────────────────────────────┐
│         Error Handler (src/lib/errorHandler.ts)             │
│                                                              │
│  1. Categorize Error (by type)                              │
│  2. Determine HTTP Status Code                              │
│  3. Log with Full Details (via logger)                      │
│  4. Generate Safe Response (environment-aware)              │
└────────────────┬────────────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         ▼               ▼
    ┌─────────┐     ┌─────────────┐
    │ LOGGER  │     │ ENVIRONMENT │
    │ .error()│     │   CHECK     │
    └────┬────┘     └────┬────────┘
         │               │
    ┌────▼──────────┐   │
    │ JSON Log      │   ├─→ Development: Full details + stack
    │ {             │   │
    │   level,      │   └─→ Production: Safe message + redacted
    │   message,    │
    │   meta,       │
    │   timestamp   │
    │ }             │
    └───────────────┘
         │
    ┌────▼─────────────────────────────────┐
    │ Console/CloudWatch/Log Aggregation   │
    └──────────────────────────────────────┘
```

## Error Flow Diagram

```
Request to API
       │
       ▼
   TRY Block
   ├─ Execute operation
   └─ Success → Return via sendSuccess()
       │
   CATCH Block
       │
       ├─ ZodError?
       │  └─ handleValidationError()
       │
       ├─ Database Error?
       │  └─ handleDatabaseError()
       │
       ├─ Auth Error?
       │  └─ handleAuthError()
       │
       └─ Generic Error
          └─ handleError(error, { type, context })
             │
             ├─ LOG (logger.error)
             │  ├─ Full stack trace
             │  ├─ Error details
             │  └─ Context (route)
             │
             └─ RESPOND
                ├─ IF Development
                │  ├─ Include stack trace
                │  └─ Show actual message
                │
                └─ IF Production
                   ├─ Redact stack trace
                   └─ Show safe message
```

## Code Flow Example

### Development Mode (NODE_ENV=development)

```typescript
// src/app/api/users/route.ts
export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany(); // ← Fails
    return sendSuccess(users);
  } catch (error) {
    return handleDatabaseError(error, "GET /api/users");
    // ↓
    // 1. Log full error:
    //    {
    //      "level": "error",
    //      "message": "Error in GET /api/users",
    //      "meta": {
    //        "type": "DATABASE_ERROR",
    //        "message": "Connection refused",
    //        "stack": "Error: Connection refused\n    at ...",
    //        "statusCode": 500
    //      },
    //      "timestamp": "2025-01-30T13:00:00Z"
    //    }
    //
    // 2. Send to client:
    //    {
    //      "success": false,
    //      "message": "Connection refused",
    //      "errorCode": "DATABASE_ERROR",
    //      "stack": "Error: Connection refused\n    at ..."
    //    }
  }
}
```

### Production Mode (NODE_ENV=production)

```typescript
// Same code, but:

// 1. Log with redacted stack:
//    {
//      "level": "error",
//      "message": "Error in GET /api/users",
//      "meta": {
//        "type": "DATABASE_ERROR",
//        "message": "Connection refused",
//        "stack": "REDACTED",  ← Stack hidden
//        "statusCode": 500
//      },
//      "timestamp": "2025-01-30T13:00:00Z"
//    }
//
// 2. Send to client:
//    {
//      "success": false,
//      "message": "A database error occurred. Please try again later.",
//      "errorCode": "DATABASE_ERROR"
//      // ← No stack trace exposed
//    }
```

## Handler Functions

### Main Handler
```
handleError(error, {
  type?: ErrorType,
  statusCode?: number,
  context: string,
  details?: Record<string, any>
})
```

### Convenience Methods
```
handleDatabaseError(error, "GET /api/users")
handleValidationError(error, "POST /api/users")
handleAuthError(error, "POST /api/auth/login")
handleAuthorizationError(error, "GET /api/admin")
```

## Integration Points

### 1. Route Level
```typescript
import { handleDatabaseError, handleValidationError } from "@/lib/errorHandler";

export async function GET(req: NextRequest) {
  try {
    // ...
  } catch (error) {
    return handleDatabaseError(error, "GET /api/endpoint");
  }
}
```

### 2. Logger Level
```typescript
import { logger } from "@/lib/logger";

logger.info("Operation started", { userId: "123" });
logger.error("Operation failed", { userId: "123", error: e.message });
```

### 3. Monitoring Level
```
// Logs are sent to:
// - Console (development)
// - CloudWatch (production)
// - DataDog/Splunk (centralized logging)
// - Alert systems (based on error patterns)
```

## Security Benefits

```
Input Request
    │
    ├─ Middleware: JWT Validation ✓
    ├─ Route: Business Logic
    ├─ Error: Try-Catch
    │
    └─ Response (Conditionally Safe)
         │
         ├─ Development: Full Details (for developers)
         │  - Stack traces
         │  - Internal error messages
         │  - Database details
         │
         └─ Production: Safe Message (for users)
            - Generic message
            - Error code only
            - NO stack traces
            - NO database info
            - NO internal details
```

## Structured Logging Benefits

### Search & Filtering
```bash
# Find all database errors
cat logs/* | grep "DATABASE_ERROR"

# Find errors in specific route
cat logs/* | grep "GET /api/users"

# Find errors by time
cat logs/* | grep "2025-01-30T13"
```

### Monitoring & Alerts
```
IF error.level === "error" AND error.meta.type === "DATABASE_ERROR"
THEN alert: "Database error detected"

IF error.level === "error" AND error.meta.statusCode === 401
THEN alert: "Authentication failures increasing"

IF COUNT(errors) > 100 IN 5_minutes
THEN alert: "Error rate spike detected"
```

### Integration with Log Services
```
CloudWatch → Logs Insights → Dashboard
DataDog    → Metrics & Anomalies
Splunk     → SPL Queries & Visualizations
```
