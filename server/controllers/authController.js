import { User } from "../models/index.js";
import { Team } from "../models/index.js";
import { generateToken } from "../utils/jwt.js";

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, college, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, email, and password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email already exists",
      });
    }

    // Create new user (password will be hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      phone,
      college,
      role: role || "teamLead",
    });

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return success response (password excluded via toJSON transform)
    return res.status(201).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error registering user",
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: "User account is inactive",
      });
    }

    // Compare password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV !== "development" ? "None" : "",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove password from response
    user.password = undefined;

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error logging in",
    });
  }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 * @access Public
 */
export const logout = async (req, res) => {
  try {
    // Clear token cookie
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      expires: new Date(0),
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error logging out",
    });
  }
};

/**
 * Get current authenticated user
 * @route GET /api/auth/me
 * @access Private
 */
export const me = async (req, res) => {
  try {
    // User is already attached to req.user by protect middleware
    return res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error fetching user data",
    });
  }
};

/**
 * Link user account to team member record
 * @route POST /api/auth/link-member
 * @access Private
 */
export const linkMemberAccount = async (req, res) => {
  try {
    const { qrToken, teamId, email } = req.body;

    // Validate input - either qrToken OR (teamId + email)
    if (!qrToken && (!teamId || !email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either qrToken or both teamId and email',
      });
    }

    let team;
    let memberIndex;
    let member;

    // Find team and member by qrToken OR by teamId + email
    if (qrToken) {
      // Find by QR token
      const result = await Team.findByMemberQR(qrToken);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'No team member found with this QR token',
        });
      }

      team = result.team;
      memberIndex = result.memberIndex;
      member = result.member;
    } else {
      // Find by teamId + email
      team = await Team.findById(teamId);
      
      if (!team) {
        return res.status(404).json({
          success: false,
          error: 'Team not found',
        });
      }

      // Find member with matching email
      memberIndex = team.members.findIndex(
        (m) => m.email.toLowerCase() === email.toLowerCase()
      );

      if (memberIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'No member found with this email in the team',
        });
      }

      member = team.members[memberIndex];
    }

    // Security check: Verify member email matches authenticated user's email
    if (member.email.toLowerCase() !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: 'Email mismatch. You can only link to your own team member record.',
      });
    }

    // Check if member is already linked to another user
    const existingUser = await User.findOne({
      teamId: team._id,
      memberIndex: memberIndex,
      _id: { $ne: req.user._id }, // Exclude current user
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'This team member is already linked to another user account',
      });
    }

    // Check if current user is already linked to a different member
    if (req.user.teamId && req.user.teamId.toString() !== team._id.toString()) {
      return res.status(400).json({
        success: false,
        error: 'Your account is already linked to a different team',
      });
    }

    // Update user with team member linking
    req.user.teamId = team._id;
    req.user.memberIndex = memberIndex;
    req.user.qrToken = member.qrToken;
    await req.user.save();

    // Fetch updated user data
    const updatedUser = await User.findById(req.user._id)
      .select('-password')
      .populate('teamId', 'teamName eventId');

    return res.status(200).json({
      success: true,
      message: 'Successfully linked to team member account',
      data: {
        user: updatedUser,
        member: {
          name: member.name,
          email: member.email,
          qrToken: member.qrToken,
        },
        team: {
          name: team.teamName,
          eventId: team.eventId,
        },
      },
    });
  } catch (error) {
    console.error('Link member account error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error linking member account',
    });
  }
};
