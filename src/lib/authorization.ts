import { NextRequest } from "next/server";

/**
 * Authorization utilities for role-based and resource-based access control
 */

export interface AuthUser {
  id: number;
  email: string;
  role: "NGO" | "GOVERNMENT";
  organizationId?: number | null;
}

/**
 * Extract authenticated user from request headers (set by middleware)
 */
export function getAuthUser(req: NextRequest | Request): AuthUser | null {
  const headers = req.headers;
  const userId = headers.get("x-user-id");
  const email = headers.get("x-user-email");
  const role = headers.get("x-user-role");
  const orgId = headers.get("x-user-org-id");

  if (!userId || !email || !role) {
    return null;
  }

  return {
    id: parseInt(userId, 10),
    email,
    role: role as "NGO" | "GOVERNMENT",
    organizationId: orgId ? parseInt(orgId, 10) : null,
  };
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser | null, ...roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if user is a GOVERNMENT user
 */
export function isGovernment(user: AuthUser | null): boolean {
  return hasRole(user, "GOVERNMENT");
}

/**
 * Check if user is an NGO user
 */
export function isNGO(user: AuthUser | null): boolean {
  return hasRole(user, "NGO");
}

/**
 * Check if user belongs to a specific organization
 */
export function belongsToOrganization(
  user: AuthUser | null,
  organizationId: number
): boolean {
  if (!user) return false;
  // GOVERNMENT users have access to all organizations
  if (isGovernment(user)) return true;
  // NGO users can only access their own organization
  return user.organizationId === organizationId;
}

/**
 * Check if user can modify a resource owned by an organization
 * - GOVERNMENT users can modify any organization's resources
 * - NGO users can only modify their own organization's resources
 */
export function canModifyOrgResource(
  user: AuthUser | null,
  resourceOrgId: number | null
): boolean {
  if (!user) return false;
  // GOVERNMENT has full access
  if (isGovernment(user)) return true;
  // If resource doesn't belong to any org, deny NGO access
  if (resourceOrgId === null) return false;
  // NGO user must belong to the same organization
  return user.organizationId === resourceOrgId;
}

/**
 * Check if user can create resources
 * - GOVERNMENT can create anything
 * - NGO can only create resources for their own organization
 */
export function canCreateForOrganization(
  user: AuthUser | null,
  targetOrgId: number
): boolean {
  if (!user) return false;
  if (isGovernment(user)) return true;
  return user.organizationId === targetOrgId;
}

/**
 * Check if user can modify user accounts
 * - GOVERNMENT can modify any user
 * - NGO admin can modify users in their organization (if we implement org admin role)
 * - Users can modify their own account
 */
export function canModifyUser(
  currentUser: AuthUser | null,
  targetUserId: number,
  targetUserOrgId: number | null
): boolean {
  if (!currentUser) return false;
  // GOVERNMENT has full access
  if (isGovernment(currentUser)) return true;
  // Users can modify their own account
  if (currentUser.id === targetUserId) return true;
  // NGO users can only modify users in their own organization
  if (isNGO(currentUser) && targetUserOrgId !== null) {
    return currentUser.organizationId === targetUserOrgId;
  }
  return false;
}

/**
 * Validate allocation status transitions
 * Defines which status changes are allowed
 */
export const ALLOCATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["IN_TRANSIT", "CANCELLED"],
  IN_TRANSIT: ["COMPLETED", "CANCELLED"],
  COMPLETED: [], // Terminal state
  REJECTED: [], // Terminal state
  CANCELLED: [], // Terminal state
};

/**
 * Check if allocation status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): boolean {
  if (currentStatus === newStatus) return true; // No change
  const allowedTransitions = ALLOCATION_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

/**
 * Check who can transition allocation to a specific status
 * - GOVERNMENT can approve/reject allocations
 * - NGO can cancel their own requests or mark as in-transit/completed
 */
export function canTransitionAllocationStatus(
  user: AuthUser | null,
  currentStatus: string,
  newStatus: string,
  allocationRequestorOrgId: number | null
): { allowed: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: "User not authenticated" };
  }

  // Check if transition is valid
  if (!isValidStatusTransition(currentStatus, newStatus)) {
    return {
      allowed: false,
      reason: `Cannot transition from ${currentStatus} to ${newStatus}`,
    };
  }

  // GOVERNMENT can approve/reject
  if (["APPROVED", "REJECTED"].includes(newStatus)) {
    if (!isGovernment(user)) {
      return {
        allowed: false,
        reason: "Only GOVERNMENT users can approve or reject allocations",
      };
    }
    return { allowed: true };
  }

  // NGO can cancel their own requests
  if (newStatus === "CANCELLED") {
    if (isGovernment(user)) {
      return { allowed: true };
    }
    if (isNGO(user) && user.organizationId === allocationRequestorOrgId) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: "You can only cancel allocations from your organization",
    };
  }

  // NGO can mark as in-transit or completed (delivery confirmation)
  if (["IN_TRANSIT", "COMPLETED"].includes(newStatus)) {
    if (isGovernment(user)) {
      return { allowed: true };
    }
    if (isNGO(user) && user.organizationId === allocationRequestorOrgId) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: "You can only update allocations for your organization",
    };
  }

  return { allowed: true };
}
