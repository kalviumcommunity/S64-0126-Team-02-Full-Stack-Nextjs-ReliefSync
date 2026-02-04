/**
 * Environment Variable Access Demonstration
 *
 * This file demonstrates the correct and safe way to access environment
 * variables in a Next.js application.
 *
 * Run this with: npx tsx src/demo/env-demo.ts
 */

console.log("=".repeat(80));
console.log("ENVIRONMENT VARIABLE ACCESS DEMONSTRATION");
console.log("=".repeat(80));

// ============================================================================
// SERVER-SIDE VARIABLES (Private - Never Exposed to Client)
// ============================================================================
console.log("\n✅ SERVER-SIDE VARIABLES (process.env)");
console.log("-".repeat(80));

// These variables are ONLY accessible in server-side code
// They will never be sent to the browser

console.log(
  "DATABASE_URL:",
  process.env.DATABASE_URL ? "✅ Set (hidden for security)" : "❌ Not set"
);
console.log(
  "JWT_SECRET:",
  process.env.JWT_SECRET ? "✅ Set (hidden for security)" : "❌ Not set"
);
console.log(
  "REDIS_URL:",
  process.env.REDIS_URL ? "✅ Set (hidden for security)" : "❌ Not set"
);
console.log("APP_NAME:", process.env.APP_NAME || "❌ Not set");
console.log("NODE_ENV:", process.env.NODE_ENV || "❌ Not set");

// ============================================================================
// CLIENT-SIDE VARIABLES (Public - Embedded in Browser Bundle)
// ============================================================================
console.log("\n⚠️  CLIENT-SIDE VARIABLES (NEXT_PUBLIC_*)");
console.log("-".repeat(80));
console.log("These variables are prefixed with NEXT_PUBLIC_ and are PUBLIC!");
console.log(
  "Never put secrets here - they will be visible in browser DevTools!"
);
console.log("-".repeat(80));

console.log(
  "NEXT_PUBLIC_API_BASE_URL:",
  process.env.NEXT_PUBLIC_API_BASE_URL || "(not set - optional)"
);
console.log(
  "NEXT_PUBLIC_APP_NAME:",
  process.env.NEXT_PUBLIC_APP_NAME || "(not set - optional)"
);

// ============================================================================
// DEMONSTRATION OF CORRECT USAGE
// ============================================================================
console.log("\n📚 USAGE EXAMPLES");
console.log("-".repeat(80));

// ✅ CORRECT: Server-side secret access
const jwtSecret = process.env.JWT_SECRET || "fallback-secret-for-dev";
console.log(
  "✅ CORRECT: JWT Secret loaded (length):",
  jwtSecret.length,
  "characters"
);

// ✅ CORRECT: Public variable for client
const publicAppName = process.env.NEXT_PUBLIC_APP_NAME || "ReliefSync";
console.log("✅ CORRECT: Public app name:", publicAppName);

// ❌ WRONG: Never do this!
console.log("\n❌ WRONG EXAMPLES (Never do this!)");
console.log("-".repeat(80));
console.log(
  "❌ const secret = process.env.NEXT_PUBLIC_JWT_SECRET; // DON'T expose secrets!"
);
console.log(
  '❌ Hardcoded: const dbUrl = "postgresql://user:pass@localhost"; // Never hardcode!'
);

// ============================================================================
// SECURITY CHECKS
// ============================================================================
console.log("\n🔒 SECURITY VALIDATION");
console.log("-".repeat(80));

const requiredVars = ["DATABASE_URL", "JWT_SECRET", "REDIS_URL"];
const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.log("⚠️  WARNING: Missing required environment variables:");
  missingVars.forEach((varName) => console.log(`   - ${varName}`));
  console.log("\nRun: cp .env.example .env.local");
  console.log("Then edit .env.local with your actual values");
} else {
  console.log("✅ All required environment variables are set!");
}

// ============================================================================
// GIT PROTECTION CHECK
// ============================================================================
console.log("\n🛡️  GIT PROTECTION CHECK");
console.log("-".repeat(80));

import { existsSync, readFileSync } from "fs";
import { join } from "path";

const gitignorePath = join(process.cwd(), ".gitignore");
if (existsSync(gitignorePath)) {
  const gitignoreContent = readFileSync(gitignorePath, "utf-8");

  if (
    gitignoreContent.includes(".env*") &&
    gitignoreContent.includes("!.env.example")
  ) {
    console.log("✅ .gitignore properly configured to protect .env.local");
    console.log("   - Ignores: .env*");
    console.log("   - Allows: !.env.example");
  } else {
    console.log("⚠️  WARNING: .gitignore may not be properly configured");
  }
} else {
  console.log("❌ ERROR: .gitignore not found!");
}

// ============================================================================
// SUMMARY
// ============================================================================
console.log("\n" + "=".repeat(80));
console.log("SUMMARY & BEST PRACTICES");
console.log("=".repeat(80));
console.log(`
✅ DO:
  - Use process.env for server-side secrets
  - Prefix client variables with NEXT_PUBLIC_
  - Keep .env.local in .gitignore
  - Commit .env.example as a template
  - Use strong random secrets in production
  - Rotate secrets regularly

❌ DON'T:
  - Put secrets in NEXT_PUBLIC_ variables
  - Hardcode credentials in source code
  - Commit .env.local to Git
  - Expose database URLs to the client
  - Use weak or default secrets in production
  - Forget fallback values for development
`);

console.log("=".repeat(80));
console.log(
  "Demo complete! Review the output above to understand safe variable access."
);
console.log("=".repeat(80));
