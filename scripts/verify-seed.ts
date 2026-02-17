#!/usr/bin/env node
/**
 * Seed Verification Script
 * Verifies that the database is properly seeded with expected data
 *
 * Usage: npm run verify-seed
 */

import dotenv from "dotenv";
import type { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Add it to .env or .env.local before running verify-seed."
  );
  process.exit(1);
}

async function getPrismaClient(): Promise<PrismaClient> {
  const prismaModule = await import("../src/lib/prisma");
  return prismaModule.prisma as PrismaClient;
}

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

async function verifySeed(): Promise<void> {
  console.log("🔍 Starting seed verification...\n");

  const checks: CheckResult[] = [];
  let prisma: PrismaClient | null = null;

  try {
    prisma = await getPrismaClient();
    // Check 1: Organizations exist
    const orgCount = await prisma.organization.count();
    checks.push({
      name: "Organizations",
      passed: orgCount > 0,
      message:
        orgCount > 0
          ? `✅ Found ${orgCount} organizations`
          : "❌ No organizations found",
      details: { count: orgCount },
    });

    // Check 2: Users exist
    const userCount = await prisma.user.count();
    const govUserCount = await prisma.user.count({
      where: { role: "GOVERNMENT" },
    });
    const ngoUserCount = await prisma.user.count({ where: { role: "NGO" } });
    checks.push({
      name: "Users",
      passed: userCount > 0 && govUserCount > 0 && ngoUserCount > 0,
      message:
        userCount > 0
          ? `✅ Found ${userCount} users (${govUserCount} GOVERNMENT, ${ngoUserCount} NGO)`
          : "❌ No users found",
      details: {
        total: userCount,
        government: govUserCount,
        ngo: ngoUserCount,
      },
    });

    // Check 3: Inventory Items exist
    const itemCount = await prisma.inventoryItem.count();
    checks.push({
      name: "Inventory Items",
      passed: itemCount > 0,
      message:
        itemCount > 0
          ? `✅ Found ${itemCount} inventory items`
          : "❌ No inventory items found",
      details: { count: itemCount },
    });

    // Check 4: Inventory records exist
    const inventoryCount = await prisma.inventory.count();
    checks.push({
      name: "Inventory Records",
      passed: inventoryCount > 0,
      message:
        inventoryCount > 0
          ? `✅ Found ${inventoryCount} inventory records`
          : "❌ No inventory records found",
      details: { count: inventoryCount },
    });

    // Check 5: Allocations exist
    const allocationCount = await prisma.allocation.count();
    const pendingCount = await prisma.allocation.count({
      where: { status: "PENDING" },
    });
    const approvedCount = await prisma.allocation.count({
      where: { status: "APPROVED" },
    });
    checks.push({
      name: "Allocations",
      passed: allocationCount > 0,
      message:
        allocationCount > 0
          ? `✅ Found ${allocationCount} allocations (${pendingCount} PENDING, ${approvedCount} APPROVED)`
          : "❌ No allocations found",
      details: {
        total: allocationCount,
        pending: pendingCount,
        approved: approvedCount,
      },
    });

    // Check 6: Data integrity - NGO users belong to organizations
    const usersWithoutOrg = await prisma.user.count({
      where: { organizationId: null, role: "NGO" },
    });
    checks.push({
      name: "User-Organization Integrity",
      passed: usersWithoutOrg === 0 || ngoUserCount === 0,
      message:
        usersWithoutOrg === 0
          ? "✅ All NGO users are assigned to organizations"
          : `⚠️  ${usersWithoutOrg} NGO users without organization`,
      details: { usersWithoutOrg },
    });

    // Check 7: Data integrity - Inventory belongs to organizations
    const allInventory = await prisma.inventory.findMany({
      select: { id: true, organizationId: true },
    });
    const inventoryWithoutOrg = allInventory.filter(
      (inv) => !inv.organizationId
    ).length;
    checks.push({
      name: "Inventory-Organization Integrity",
      passed: inventoryWithoutOrg === 0 || inventoryCount === 0,
      message:
        inventoryWithoutOrg === 0
          ? "✅ All inventory records linked to organizations"
          : `⚠️  ${inventoryWithoutOrg} inventory records without organization`,
      details: { inventoryWithoutOrg },
    });

    // Print results
    console.log("\n📊 Verification Results:\n");
    checks.forEach((check) => {
      console.log(check.message);
      if (check.details && Object.keys(check.details).length > 0) {
        console.log(`   Details: ${JSON.stringify(check.details)}\n`);
      }
    });

    // Overall result
    const allPassed = checks.every((check) => check.passed);
    if (allPassed) {
      console.log(
        "\n✅ Seed verification PASSED - Database is properly seeded\n"
      );
      process.exit(0);
    } else {
      const failedCount = checks.filter((check) => !check.passed).length;
      console.log(
        `\n❌ Seed verification FAILED - ${failedCount} checks failed\n`
      );
      console.log("💡 Try running: npm run db:seed\n");
      process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Error during verification:");
    console.error(error instanceof Error ? error.message : String(error));
    console.log(
      "\n💡 Make sure the database is accessible and migrations are applied"
    );
    console.log("   Run: npx prisma migrate deploy\n");
    process.exit(1);
  } finally {
    if (prisma) {
      await prisma.$disconnect();
    }
  }
}

// Run verification
verifySeed().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
