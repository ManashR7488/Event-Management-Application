/**
 * Role hierarchy levels
 * Higher number = higher privilege level
 */
export const ROLE_HIERARCHY = {
  teamLead: 1,
  staff: 2,
  organizer: 3,
  admin: 4,
};

/**
 * Check if user has a specific role
 * @param {Object} user - User object with role property
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  if (!user || !user.role) {
    return false;
  }
  return user.role === role;
};

/**
 * Check if user has any of the specified roles
 * @param {Object} user - User object with role property
 * @param {string[]} roles - Array of roles to check
 * @returns {boolean}
 */
export const hasAnyRole = (user, roles) => {
  if (!user || !user.role || !Array.isArray(roles)) {
    return false;
  }
  return roles.includes(user.role);
};

/**
 * Get numeric level for a role
 * @param {string} role - Role name
 * @returns {number} Numeric level or 0 if role not found
 */
export const getRoleLevel = (role) => {
  return ROLE_HIERARCHY[role] || 0;
};

/**
 * Check if user's role meets or exceeds minimum level in hierarchy
 * @param {Object} user - User object with role property
 * @param {string} minimumRole - Minimum required role
 * @returns {boolean}
 */
export const hasMinimumRole = (user, minimumRole) => {
  if (!user || !user.role) {
    return false;
  }
  const userLevel = getRoleLevel(user.role);
  const minimumLevel = getRoleLevel(minimumRole);
  return userLevel >= minimumLevel;
};

/**
 * Compare two roles in hierarchy
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean} True if role1 is higher than role2
 */
export const isHigherRole = (role1, role2) => {
  const level1 = getRoleLevel(role1);
  const level2 = getRoleLevel(role2);
  return level1 > level2;
};

/**
 * Validate if role change is allowed
 * Only admins can promote to organizer or admin
 * Organizers can promote to staff
 * Staff cannot promote others
 * @param {string} currentRole - Current role of the user making the change
 * @param {string} newRole - New role being assigned
 * @returns {Object} { allowed: boolean, reason: string }
 */
export const validateRoleTransition = (currentRole, newRole) => {
  const currentLevel = getRoleLevel(currentRole);
  const newLevel = getRoleLevel(newRole);

  // Admin can change to any role
  if (currentRole === 'admin') {
    return { allowed: true, reason: 'Admin has full permissions' };
  }

  // Organizer can promote up to staff level
  if (currentRole === 'organizer' && newLevel <= getRoleLevel('staff')) {
    return { allowed: true, reason: 'Organizer can assign staff and teamLead roles' };
  }

  // Staff and teamLead cannot promote others
  if (currentLevel < getRoleLevel('organizer')) {
    return {
      allowed: false,
      reason: 'Insufficient permissions to change roles',
    };
  }

  // Trying to assign a role higher than current user's role
  if (newLevel > currentLevel) {
    return {
      allowed: false,
      reason: 'Cannot assign a role higher than your own',
    };
  }

  return { allowed: true, reason: 'Role transition permitted' };
};

/**
 * Check if user can access resources owned by another role
 * Users can access their own resources
 * Higher roles can access lower role resources
 * @param {string} userRole - Role of the user trying to access
 * @param {string} resourceOwnerRole - Role of the resource owner
 * @returns {boolean}
 */
export const canAccessResource = (userRole, resourceOwnerRole) => {
  const userLevel = getRoleLevel(userRole);
  const ownerLevel = getRoleLevel(resourceOwnerRole);

  // Higher or equal role can access
  return userLevel >= ownerLevel;
};
