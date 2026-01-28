import { prisma } from '@/lib/prisma';

/**
 * Get all users from the database
 * Returns: User records with their associated organization
 */
export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            registrationNo: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return users;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

/**
 * Get a user by email
 * Returns: Single user record or null
 */
export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organization: true,
        allocationsCreated: {
          include: {
            fromOrg: true,
            toOrg: true,
          },
          take: 5, // Last 5 allocations
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return user;
  } catch (error) {
    console.error(`Error fetching user with email ${email}:`, error);
    throw error;
  }
}

/**
 * Get all users by role
 * Returns: Users filtered by their role (NGO or GOVERNMENT)
 */
export async function getUsersByRole(role: 'NGO' | 'GOVERNMENT') {
  try {
    const users = await prisma.user.findMany({
      where: { role },
      include: { organization: true },
      orderBy: { name: 'asc' },
    });
    return users;
  } catch (error) {
    console.error(`Error fetching users with role ${role}:`, error);
    throw error;
  }
}

/**
 * Count total users in the system
 * Returns: Total number of users
 */
export async function countUsers() {
  try {
    const count = await prisma.user.count();
    return count;
  } catch (error) {
    console.error('Error counting users:', error);
    throw error;
  }
}
