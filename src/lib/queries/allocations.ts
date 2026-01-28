import { prisma } from '@/lib/prisma';
import { AllocationStatus } from '@prisma/client';

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
      orderBy: { requestDate: 'desc' },
    });
    return allocations;
  } catch (error) {
    console.error('Error fetching allocations:', error);
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
      orderBy: { requestDate: 'desc' },
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
      orderBy: { requestDate: 'desc' },
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
      orderBy: { requestDate: 'desc' },
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
      where: { status: 'PENDING' },
      include: {
        fromOrg: true,
        toOrg: true,
      },
      orderBy: { requestDate: 'asc' }, // Oldest first (urgent)
    });
    return allocations;
  } catch (error) {
    console.error('Error fetching pending allocations:', error);
    throw error;
  }
}

/**
 * Count allocations by status
 * Returns: Object with count for each allocation status
 */
export async function countAllocationsByStatus() {
  try {
    const statuses: AllocationStatus[] = [
      'PENDING',
      'APPROVED',
      'IN_TRANSIT',
      'COMPLETED',
      'REJECTED',
      'CANCELLED',
    ];

    const counts: Record<AllocationStatus, number> = {} as Record<
      AllocationStatus,
      number
    >;

    for (const status of statuses) {
      counts[status] = await prisma.allocation.count({
        where: { status },
      });
    }

    return counts;
  } catch (error) {
    console.error('Error counting allocations by status:', error);
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
      orderBy: { requestDate: 'desc' },
    });
    return allocations;
  } catch (error) {
    console.error('Error fetching allocations by date range:', error);
    throw error;
  }
}
