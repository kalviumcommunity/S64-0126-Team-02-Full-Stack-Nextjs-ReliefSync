import { prisma } from "@/lib/prisma";
import { AllocationStatus } from "@prisma/client";

/**
 * Get all allocations with full relationship data
 * Returns: Allocation records with source org, recipient org, and item details
 */
export async function getAllAllocations() {
  try {
    const allocations = await prisma.allocation.findMany({
      include: {
        fromOrg: { select: { id: true, name: true } },
        toOrg: { select: { id: true, name: true } },
        approver: { select: { id: true, name: true, email: true } },
      },
      orderBy: { requestDate: "desc" },
    });
    return allocations;
  } catch (error) {
    console.error("Error fetching allocations:", error);
    throw error;
  }
}

/**
 * Get allocations by status (workflow state)
 * Returns: Allocations filtered by status (PENDING, APPROVED, IN_TRANSIT, etc.)
 */
export async function getAllocationsByStatus(status: AllocationStatus) {
  try {
    const allocations = await prisma.allocation.findMany({
      where: { status },
      include: {
        fromOrg: true,
        toOrg: true,
        approver: true,
      },
      orderBy: { requestDate: "desc" },
    });
    return allocations;
  } catch (error) {
    console.error(`Error fetching allocations with status ${status}:`, error);
    throw error;
  }
}

/**
 * Get allocations for a specific organization (as recipient)
 * Returns: Allocations received by the organization
 */
export async function getAllocationsToOrganization(organizationId: number) {
  try {
    const allocations = await prisma.allocation.findMany({
      where: { toOrgId: organizationId },
      include: {
        fromOrg: true,
        approver: true,
      },
      orderBy: { requestDate: "desc" },
    });
    return allocations;
  } catch (error) {
    console.error(
      `Error fetching allocations for organization ${organizationId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get allocations from a specific organization (as source)
 * Returns: Allocations sent by the organization
 */
export async function getAllocationsFromOrganization(organizationId: number) {
  try {
    const allocations = await prisma.allocation.findMany({
      where: { fromOrgId: organizationId },
      include: {
        toOrg: true,
        approver: true,
      },
      orderBy: { requestDate: "desc" },
    });
    return allocations;
  } catch (error) {
    console.error(
      `Error fetching allocations from organization ${organizationId}:`,
      error
    );
    throw error;
  }
}

/**
 * Get pending allocations (awaiting approval)
 * Returns: All allocations with status = PENDING
 */
export async function getPendingAllocations() {
  try {
    const allocations = await prisma.allocation.findMany({
      where: { status: "PENDING" },
      include: {
        fromOrg: true,
        toOrg: true,
      },
      orderBy: { requestDate: "asc" }, // Oldest first (urgent)
    });
    return allocations;
  } catch (error) {
    console.error("Error fetching pending allocations:", error);
    throw error;
  }
}

/**
 * Count allocations by status
 * Returns: Object with count for each allocation status
 */
export async function countAllocationsByStatus() {
  try {
    const grouped = await prisma.allocation.groupBy({
      by: ["status"],
      _count: { _all: true },
    });

    const counts: Record<AllocationStatus, number> = {
      PENDING: 0,
      APPROVED: 0,
      IN_TRANSIT: 0,
      COMPLETED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };

    for (const row of grouped) {
      counts[row.status] = row._count._all;
    }

    return counts;
  } catch (error) {
    console.error("Error counting allocations by status:", error);
    throw error;
  }
}

/**
 * Get allocation timeline for analytics
 * Returns: Allocations with date range filtering
 */
export async function getAllocationsByDateRange(
  startDate: Date,
  endDate: Date
) {
  try {
    const allocations = await prisma.allocation.findMany({
      where: {
        requestDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        fromOrg: true,
        toOrg: true,
      },
      orderBy: { requestDate: "desc" },
    });
    return allocations;
  } catch (error) {
    console.error("Error fetching allocations by date range:", error);
    throw error;
  }
}

type ApproveAllocationInput = {
  allocationId: number;
  approverId: number;
};

/**
 * Approve an allocation and decrement source inventory atomically
 * Ensures: allocation status update + inventory update succeed together
 */
export async function approveAllocationAndUpdateInventory({
  allocationId,
  approverId,
}: ApproveAllocationInput) {
  try {
    const updatedAllocation = await prisma.$transaction(async (tx) => {
      const allocation = await tx.allocation.findUnique({
        where: { id: allocationId },
        select: {
          id: true,
          status: true,
          fromOrgId: true,
          itemId: true,
          quantity: true,
        },
      });

      if (!allocation) {
        throw new Error("Allocation not found");
      }

      if (allocation.status !== "PENDING") {
        throw new Error("Only pending allocations can be approved");
      }

      if (!allocation.fromOrgId) {
        throw new Error("Allocation has no source organization");
      }

      const inventory = await tx.inventory.findUnique({
        where: {
          organizationId_itemId: {
            organizationId: allocation.fromOrgId,
            itemId: allocation.itemId,
          },
        },
        select: { id: true, quantity: true },
      });

      if (!inventory) {
        throw new Error("Inventory record not found");
      }

      if (inventory.quantity < allocation.quantity) {
        throw new Error("Insufficient inventory for allocation");
      }

      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: { decrement: allocation.quantity },
          lastUpdated: new Date(),
        },
      });

      return tx.allocation.update({
        where: { id: allocation.id },
        data: {
          status: "APPROVED",
          approvedBy: approverId,
          approvedDate: new Date(),
        },
      });
    });

    return updatedAllocation;
  } catch (error) {
    console.error("Transaction failed. Rolling back.", error);
    throw error;
  }
}
