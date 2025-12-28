import { Team, Event, User } from '../models/index.js';
import mongoose from 'mongoose';

/**
 * Create new team
 * @route POST /api/teams
 * @access Team Lead only
 */
export const createTeam = async (req, res) => {
  try {
    const { eventId, teamName, members } = req.body;

    // Validate required fields
    if (!eventId || !teamName || !members) {
      return res.status(400).json({
        success: false,
        error: 'Please provide eventId, teamName, and members',
      });
    }

    // Validate eventId is a valid MongoDB ObjectId
    if (!eventId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format',
      });
    }

    // Validate teamName is non-empty
    if (typeof teamName !== 'string' || teamName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Team name must be a non-empty string',
      });
    }

    // Validate members is an array with at least one member
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Members must be an array with at least one member',
      });
    }

    // Validate each member has required fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const member of members) {
      if (!member.name || !member.email || !member.college || !member.rollNumber) {
        return res.status(400).json({
          success: false,
          error: 'Each member must have name, email, college, and rollNumber',
        });
      }

      // Validate email format
      if (!emailRegex.test(member.email)) {
        return res.status(400).json({
          success: false,
          error: `Invalid email format: ${member.email}`,
        });
      }
    }

    // Check for duplicate emails within members array
    const emails = members.map((m) => m.email.toLowerCase());
    const uniqueEmails = new Set(emails);
    if (emails.length !== uniqueEmails.size) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate emails found within members',
      });
    }

    // Fetch event
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found',
      });
    }

    // Validate event is active and registration is open
    if (!event.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Event is not active',
      });
    }

    if (!event.registrationOpen) {
      return res.status(400).json({
        success: false,
        error: 'Event registration is closed',
      });
    }

    // Check if max teams limit is reached
    if (event.maxTeams) {
      const existingTeamsCount = await Team.countDocuments({ eventId });
      if (existingTeamsCount >= event.maxTeams) {
        return res.status(400).json({
          success: false,
          error: `Maximum teams limit (${event.maxTeams}) reached for this event`,
        });
      }
    }

    // Extract lead info from req.user
    const leadUserId = req.user._id;
    const leadEmail = req.user.email;
    const leadName = req.user.name;
    const leadPhone = req.user.phone;

    // Create team (pre-save hooks will handle QR generation and validation)
    const team = await Team.create({
      eventId,
      teamName,
      leadUserId,
      leadEmail,
      leadName,
      leadPhone,
      members,
    });

    // Auto-link existing users to their team members
    for (let i = 0; i < team.members.length; i++) {
      const member = team.members[i];
      const user = await User.findOne({ email: member.email });
      
      if (user && !user.teamId) {
        // Auto-link user to this member
        user.teamId = team._id;
        user.memberIndex = i;
        user.qrToken = member.qrToken;
        await user.save();
      }
    }

    // Update event stats using atomic operations
    await Event.findByIdAndUpdate(eventId, {
      $inc: {
        'stats.totalTeamsRegistered': 1,
        'stats.totalMembersRegistered': members.length,
      },
    });

    // console.log(team);

    return res.status(201).json({
      success: true,
      data: {
        team,
      },
    });
  } catch (error) {
    console.error('Create team error:', error);
    
    // Handle MongoDB duplicate key errors
    if (error.code === 11000) {
      if (error.keyPattern?.leadUserId && error.keyPattern?.eventId) {
        return res.status(400).json({
          success: false,
          error: 'You have already registered a team for this event. Please edit your existing team instead.',
        });
      }
      if (error.keyPattern?.teamName && error.keyPattern?.eventId) {
        return res.status(400).json({
          success: false,
          error: 'A team with this name already exists for this event. Please choose a different name.',
        });
      }
    }
    
    return res.status(500).json({
      success: false,
      error: error.message || 'Error creating team',
    });
  }
};

/**
 * Get team by ID
 * @route GET /api/teams/:id
 * @access Team Lead (own teams) or Organizer/Admin
 */
export const getTeamById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team ID format',
      });
    }

    // Fetch team with populated event details
    const team = await Team.findById(id).populate('eventId');

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Authorization check: team lead can only view their own teams, organizers/admins can view any
    if (team.leadUserId.toString() !== req.user._id.toString()) {
      if (!['organizer', 'admin'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You can only view your own teams',
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        team,
      },
    });
  } catch (error) {
    console.error('Get team by ID error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error fetching team',
    });
  }
};

/**
 * Add members to existing team
 * @route PATCH /api/teams/:id/members
 * @access Team Lead (own teams only)
 */
export const addMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { members } = req.body;

    // Validate members array is provided and not empty
    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Members must be an array with at least one member',
      });
    }

    // Validate each member has required fields
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (const member of members) {
      if (!member.name || !member.email || !member.college || !member.rollNumber) {
        return res.status(400).json({
          success: false,
          error: 'Each member must have name, email, college, and rollNumber',
        });
      }

      // Validate email format
      if (!emailRegex.test(member.email)) {
        return res.status(400).json({
          success: false,
          error: `Invalid email format: ${member.email}`,
        });
      }
    }

    // Fetch team with populated event
    const team = await Team.findById(id).populate('eventId');

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Authorization check: only team lead can add members to their own team
    if (team.leadUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only manage your own teams',
      });
    }

    // Validate event registration is still open
    if (!team.eventId.registrationOpen) {
      return res.status(400).json({
        success: false,
        error: 'Event registration is closed',
      });
    }

    // Calculate new total member count
    const newTotalMembers = team.members.length + members.length;

    // Validate new count doesn't exceed event's maxTeamSize
    if (newTotalMembers > team.eventId.maxTeamSize) {
      return res.status(400).json({
        success: false,
        error: `Adding ${members.length} members would exceed maximum team size of ${team.eventId.maxTeamSize}`,
      });
    }

    // Check for duplicate emails within new members
    const newEmails = members.map((m) => m.email.toLowerCase());
    const uniqueNewEmails = new Set(newEmails);
    if (newEmails.length !== uniqueNewEmails.size) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate emails found within new members',
      });
    }

    // Check for duplicate emails between new and existing members
    const existingEmails = team.members.map((m) => m.email.toLowerCase());
    for (const email of newEmails) {
      if (existingEmails.includes(email)) {
        return res.status(400).json({
          success: false,
          error: `Email ${email} already exists in the team`,
        });
      }
    }

    // Add new members to team
    team.members.push(...members);

    // Save team (triggers pre-save hooks for QR generation and validation)
    await team.save();

    // Auto-link existing users to their newly added team members
    const startIndex = team.members.length - members.length;
    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const memberIndex = startIndex + i;
      const user = await User.findOne({ email: member.email });
      
      if (user && !user.teamId) {
        // Auto-link user to this member
        user.teamId = team._id;
        user.memberIndex = memberIndex;
        user.qrToken = team.members[memberIndex].qrToken;
        await user.save();
      }
    }

    // Update event stats using atomic operations
    await Event.findByIdAndUpdate(team.eventId._id, {
      $inc: {
        'stats.totalMembersRegistered': members.length,
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        team,
      },
    });
  } catch (error) {
    console.error('Add members error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error adding members',
    });
  }
};

/**
 * Remove member from team
 * @route DELETE /api/teams/:id/members/:memberId
 * @access Team Lead (own team only)
 */
export const removeMember = async (req, res) => {
  try {
    const { id: teamId, memberId } = req.params;

    // Validate ObjectIds
    if (!mongoose.isValidObjectId(teamId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team ID',
      });
    }

    if (!mongoose.isValidObjectId(memberId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid member ID',
      });
    }

    // Fetch team with populated event
    const team = await Team.findById(teamId).populate('eventId');

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Authorization: Only team lead can remove members from their own team
    if (team.leadUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this team',
      });
    }

    // Check if event registration is still open
    if (!team.eventId.registrationOpen) {
      return res.status(400).json({
        success: false,
        error: 'Event registration is closed. Cannot modify team.',
      });
    }

    // Find member by memberId
    const member = team.members.id(memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Member not found in team',
      });
    }

    // Check if member is already checked in
    if (member.isCheckedIn) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove member who has already checked in',
      });
    }

    // Validate new member count doesn't go below minimum
    const newMemberCount = team.members.length - 1;
    if (newMemberCount < team.eventId.minTeamSize) {
      return res.status(400).json({
        success: false,
        error: `Cannot remove member. Minimum team size is ${team.eventId.minTeamSize}`,
      });
    }

    // Remove member from array
    member.remove();

    // Save team
    await team.save();

    // Update event stats: decrement totalMembersRegistered
    await Event.findByIdAndUpdate(team.eventId._id, {
      $inc: { 'stats.totalMembersRegistered': -1 },
    });

    return res.status(200).json({
      success: true,
      data: {
        team,
      },
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error removing member',
    });
  }
};

/**
 * Update team information (name, phone)
 * @route PATCH /api/teams/:id
 * @access Team Lead (own team only)
 */
export const updateTeam = async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const { teamName, leadPhone } = req.body;

    // Validate ObjectId
    if (!mongoose.isValidObjectId(teamId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid team ID',
      });
    }

    // Validate teamName if provided
    if (teamName !== undefined) {
      if (typeof teamName !== 'string' || teamName.trim() === '') {
        return res.status(400).json({
          success: false,
          error: 'Team name must be a non-empty string',
        });
      }
    }

    // Fetch team with populated event
    const team = await Team.findById(teamId).populate('eventId');

    if (!team) {
      return res.status(404).json({
        success: false,
        error: 'Team not found',
      });
    }

    // Authorization: Only team lead can update their own team
    if (team.leadUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this team',
      });
    }

    // Note: Allow editing team info (name, phone) even after registration closes
    // Member add/remove operations are still gated by registrationOpen in their respective endpoints

    // If teamName is being changed, check for duplicates
    if (teamName && teamName.trim() !== team.teamName) {
      const duplicateTeam = await Team.findOne({
        eventId: team.eventId._id,
        teamName: teamName.trim(),
        _id: { $ne: teamId },
      });

      if (duplicateTeam) {
        return res.status(400).json({
          success: false,
          error: 'A team with this name already exists for this event',
        });
      }

      team.teamName = teamName.trim();
    }

    // Update leadPhone if provided
    if (leadPhone !== undefined) {
      team.leadPhone = leadPhone.trim();
    }

    // Save team
    await team.save();

    return res.status(200).json({
      success: true,
      data: {
        team,
      },
      message: 'Team updated successfully',
    });
  } catch (error) {
    console.error('Update team error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error updating team',
    });
  }
};

/**
 * Get all teams for current user (team lead)
 * @route GET /api/teams/my
 * @access Team Lead
 */
export const getMyTeams = async (req, res) => {
  try {
    // Fetch all teams where leadUserId matches current user
    const teams = await Team.find({ leadUserId: req.user._id }).populate('eventId');

    return res.status(200).json({
      success: true,
      data: {
        teams,
        count: teams.length,
      },
    });
  } catch (error) {
    console.error('Get my teams error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error fetching teams',
    });
  }
};
