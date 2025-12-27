import mongoose from 'mongoose';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Team from '../models/Team.js';

// @desc    Get all users with filters and pagination
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', isActive = '' } = req.query;
    
    // Build query
    const query = {};
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Filter by role
    if (role) {
      query.role = role;
    }
    
    // Filter by active status
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    
    // Fetch users
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
};

// @desc    Activate user account
// @route   PATCH /api/admin/users/:id/activate
// @access  Private/Admin
export const activateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }
    
    // Validate user exists
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update user status
    user.isActive = true;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'User activated successfully'
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to activate user'
    });
  }
};

// @desc    Deactivate user account
// @route   PATCH /api/admin/users/:id/deactivate
// @access  Private/Admin
export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }
    
    // Prevent admin from deactivating themselves
    if (id === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You cannot deactivate your own account'
      });
    }
    
    // Validate user exists
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update user status
    user.isActive = false;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deactivate user'
    });
  }
};

// @desc    Update user role
// @route   PATCH /api/admin/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }
    
    // Validate role
    const validRoles = ['teamLead', 'staff', 'organizer', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be one of: teamLead, staff, organizer, admin'
      });
    }
    
    // Prevent admin from changing their own role
    if (id === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You cannot change your own role'
      });
    }
    
    // Validate user exists
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update user role
    user.role = role;
    await user.save();
    
    res.status(200).json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user role'
    });
  }
};

// @desc    Delete user permanently
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate ObjectId format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }
    
    // Prevent admin from deleting themselves
    if (id === req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'You cannot delete your own account'
      });
    }
    
    // Validate user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check for dependencies (teams led by this user)
    if (user.role === 'teamLead') {
      const teamsCount = await Team.countDocuments({ lead: id });
      if (teamsCount > 0) {
        return res.status(400).json({
          success: false,
          error: `Cannot delete user. They are leading ${teamsCount} team(s). Please reassign teams first.`
        });
      }
    }
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user'
    });
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getPlatformStats = async (req, res) => {
  try {
    // Total users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    // Active vs inactive users
    const activeUsers = await User.countDocuments({ isActive: true });
    const inactiveUsers = await User.countDocuments({ isActive: false });
    
    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    // Total events
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ isActive: true });
    
    // Total teams
    const totalTeams = await Team.countDocuments();
    
    // Total members (sum of all team members)
    const teamsWithMembers = await Team.find().select('members');
    const totalMembers = teamsWithMembers.reduce((sum, team) => sum + team.members.length, 0);
    
    // Format users by role
    const roleStats = {};
    usersByRole.forEach(item => {
      roleStats[item._id] = item.count;
    });
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: activeUsers + inactiveUsers,
          active: activeUsers,
          inactive: inactiveUsers,
          byRole: {
            admin: roleStats.admin || 0,
            organizer: roleStats.organizer || 0,
            staff: roleStats.staff || 0,
            teamLead: roleStats.teamLead || 0
          },
          recentRegistrations
        },
        events: {
          total: totalEvents,
          active: activeEvents
        },
        teams: {
          total: totalTeams,
          totalMembers
        }
      }
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform statistics'
    });
  }
};
