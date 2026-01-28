import { prisma } from '@/lib/prisma';

/**
 * Get all organizations (NGOs) in the system
 * Returns: Organization records with user and inventory counts
 */
export async function getOrganizations() {
  try {
    const organizations = await prisma.organization.findMany({
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        inventories: {
          select: { id: true, quantity: true, item: true },
          take: 5, // Show top 5 inventory items
        },
        _count: {
          select: {
            users: true,
            inventories: true,
            allocationsFrom: true,
            allocationsTo: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return organizations;
  } catch (error) {
    console.error('Error fetching organizations:', error);
    throw error;
  }
}

/**
 * Get a specific organization by ID
 * Returns: Full organization details with all relationships
 */
export async function getOrganizationById(id: number) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: true,
        inventories: {
          include: { item: true },
        },
        allocationsFrom: {
          include: { toOrg: true, item: true },
          take: 10,
          orderBy: { requestDate: 'desc' },
        },
        allocationsTo: {
          include: { fromOrg: true, item: true },
          take: 10,
          orderBy: { requestDate: 'desc' },
        },
      },
    });
    return organization;
  } catch (error) {
    console.error(`Error fetching organization ${id}:`, error);
    throw error;
  }
}

/**
 * Get active organizations only
 * Returns: Only organizations with isActive = true
 */
export async function getActiveOrganizations() {
  try {
    const organizations = await prisma.organization.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { users: true, inventories: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    return organizations;
  } catch (error) {
    console.error('Error fetching active organizations:', error);
    throw error;
  }
}

/**
 * Count total organizations
 * Returns: Total number of organizations
 */
export async function countOrganizations() {
  try {
    const count = await prisma.organization.count();
    return count;
  } catch (error) {
    console.error('Error counting organizations:', error);
    throw error;
  }
}

/**
 * Get organization by registration number
 * Returns: Organization record with full details
 */
export async function getOrganizationByRegistration(registrationNo: string) {
  try {
    const organization = await prisma.organization.findUnique({
      where: { registrationNo },
      include: {
        users: true,
        inventories: { include: { item: true } },
      },
    });
    return organization;
  } catch (error) {
    console.error(
      `Error fetching organization with registration ${registrationNo}:`,
      error
    );
    throw error;
  }
}
