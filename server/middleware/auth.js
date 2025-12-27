import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/index.js';

/**
 * Protect middleware - Verify JWT token and attach user to request
 */
export const protect = async (req, res, next) => {
  try {
    // Extract token from HTTP-only cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token provided',
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account is inactive',
      });
    }

    // Attach user to request object
    req.user = user;

    // Proceed to next middleware/controller
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message || 'Not authorized, token verification failed',
    });
  }
};

/**
 * Authorize middleware factory - Check if user has required role(s)
 * Must be used after protect middleware
 * @param  {...string} roles - One or more allowed roles
 * @returns {Function} Express middleware function
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if req.user exists (should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated. Please use protect middleware first.',
      });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Required role(s): [${roles.join(', ')}]. Your role: ${req.user.role}`,
      });
    }

    // User is authorized, proceed to next middleware/controller
    next();
  };
};

/**
 * Convenience middleware - Authorize only teamLead role
 */
export const authorizeTeamLead = authorize('teamLead');

/**
 * Convenience middleware - Authorize only staff role
 */
export const authorizeStaff = authorize('staff');

/**
 * Convenience middleware - Authorize only organizer role
 */
export const authorizeOrganizer = authorize('organizer');

/**
 * Convenience middleware - Authorize only admin role
 */
export const authorizeAdmin = authorize('admin');

/**
 * Convenience middleware - Authorize staff or organizer roles
 */
export const authorizeStaffOrOrganizer = authorize('staff', 'organizer');

/**
 * Convenience middleware - Authorize organizer or admin roles
 */
export const authorizeOrganizerOrAdmin = authorize('organizer', 'admin');
