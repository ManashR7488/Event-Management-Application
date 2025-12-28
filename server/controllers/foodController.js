import Team from '../models/Team.js';
import Event from '../models/Event.js';
import FoodDistributionLog from '../models/FoodDistributionLog.js';

// @desc    Check food eligibility for a member
// @route   POST /api/food/check-eligibility
// @access  Private (authenticated users)
export const checkFoodEligibility = async (req, res) => {
  try {
    const { eventCanteenQR } = req.body;

    // Validate eventCanteenQR
    if (!eventCanteenQR || typeof eventCanteenQR !== 'string' || eventCanteenQR.trim().length === 0) {
      return res.status(400).json({
        success: false,
        eligible: false,
        error: 'Please provide a valid event canteen QR code',
      });
    }

    // Check if user is linked to a team member
    if (!req.user.teamId || req.user.memberIndex === null) {
      return res.status(400).json({
        success: false,
        eligible: false,
        error: 'Your account is not linked to a team member. Please contact your team lead or link your account.',
      });
    }

    // Find event by canteen QR token
    const event = await Event.findOne({ canteenQRToken: eventCanteenQR });

    if (!event) {
      await FoodDistributionLog.create({
        eventId: null,
        teamId: req.user.teamId,
        memberId: null,
        memberName: req.user.name,
        memberEmail: req.user.email,
        memberQRToken: req.user.qrToken,
        eventCanteenQR: eventCanteenQR,
        eligible: false,
        reason: 'Invalid event canteen QR code',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
      });

      return res.status(404).json({
        success: false,
        eligible: false,
        error: 'Invalid event canteen QR code',
      });
    }

    // Check if event is active
    if (!event.isActive) {
      await FoodDistributionLog.create({
        eventId: event._id,
        teamId: req.user.teamId,
        memberId: null,
        memberName: req.user.name,
        memberEmail: req.user.email,
        memberQRToken: req.user.qrToken,
        eventCanteenQR: eventCanteenQR,
        eligible: false,
        reason: 'Event is not active',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
      });

      return res.status(400).json({
        success: false,
        eligible: false,
        error: 'Event is not active',
      });
    }

    // Find team and member
    const team = await Team.findById(req.user.teamId);

    if (!team) {
      return res.status(404).json({
        success: false,
        eligible: false,
        error: 'Team not found',
      });
    }

    const member = team.members[req.user.memberIndex];

    if (!member) {
      return res.status(404).json({
        success: false,
        eligible: false,
        error: 'Member not found in team',
      });
    }

    // Verify member belongs to the scanned event
    if (team.eventId.toString() !== event._id.toString()) {
      await FoodDistributionLog.create({
        eventId: event._id,
        teamId: team._id,
        memberId: member._id,
        memberName: member.name,
        memberEmail: member.email,
        memberQRToken: member.qrToken,
        eventCanteenQR: eventCanteenQR,
        eligible: false,
        reason: 'Member does not belong to this event',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
      });

      return res.status(400).json({
        success: false,
        eligible: false,
        error: 'You are not registered for this event',
        data: {
          yourEvent: team.eventId,
          scannedEvent: event.name,
        },
      });
    }

    // Check if member is checked in
    if (!member.isCheckedIn) {
      await FoodDistributionLog.create({
        eventId: event._id,
        teamId: team._id,
        memberId: member._id,
        memberName: member.name,
        memberEmail: member.email,
        memberQRToken: member.qrToken,
        eventCanteenQR: eventCanteenQR,
        eligible: false,
        reason: 'Member must complete check-in first',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
      });

      return res.status(200).json({
        success: false,
        eligible: false,
        error: 'You must complete check-in at the gate first',
        data: {
          member: {
            name: member.name,
            email: member.email,
          },
          event: {
            name: event.name,
          },
          isCheckedIn: false,
        },
      });
    }

    // Member is eligible - log successful eligibility check
    await FoodDistributionLog.create({
      eventId: event._id,
      teamId: team._id,
      memberId: member._id,
      memberName: member.name,
      memberEmail: member.email,
      memberQRToken: member.qrToken,
      eventCanteenQR: eventCanteenQR,
      eligible: true,
      reason: 'Eligible for food',
      scannedAt: new Date(),
      scannedBy: req.user._id,
      scannedByName: req.user.name,
    });

    return res.status(200).json({
      success: true,
      eligible: true,
      message: 'You are eligible for food!',
      data: {
        member: {
          name: member.name,
          email: member.email,
          qrToken: member.qrToken,
        },
        event: {
          name: event.name,
          venue: event.venue,
        },
        checkInTime: member.checkInTime,
      },
    });
  } catch (error) {
    console.error('Check food eligibility error:', error);

    try {
      await FoodDistributionLog.create({
        eventId: null,
        teamId: req.user?.teamId || null,
        memberId: null,
        memberName: req.user?.name || 'Unknown',
        memberEmail: req.user?.email || 'Unknown',
        memberQRToken: req.user?.qrToken || 'Unknown',
        eventCanteenQR: req.body.eventCanteenQR || 'Unknown',
        eligible: false,
        reason: error.message || 'Error checking food eligibility',
        scannedAt: new Date(),
        scannedBy: req.user?._id || null,
        scannedByName: req.user?.name || 'Unknown',
      });
    } catch (logError) {
      console.error('Failed to log food eligibility error:', logError);
    }

    return res.status(500).json({
      success: false,
      eligible: false,
      error: error.message || 'Error checking food eligibility',
    });
  }
};

// @desc    Log food distribution for a member
// @route   POST /api/food/scan
// @access  Private (authenticated users)
export const logFoodDistribution = async (req, res) => {
  try {
    const { eventCanteenQR, memberQRToken, mealType } = req.body;

    // Validate both QR tokens are provided
    if (!eventCanteenQR || typeof eventCanteenQR !== 'string' || eventCanteenQR.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid event canteen QR code',
      });
    }

    if (!memberQRToken || typeof memberQRToken !== 'string' || memberQRToken.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid member QR token',
      });
    }

    // Find event by canteen QR token
    const event = await Event.findOne({ canteenQRToken: eventCanteenQR });

    if (!event) {
      // Log failed distribution attempt - invalid event
      await FoodDistributionLog.create({
        eventId: null,
        teamId: null,
        memberId: null,
        memberName: 'Unknown',
        memberEmail: 'Unknown',
        memberQRToken: memberQRToken,
        eventCanteenQR: eventCanteenQR,
        mealType: mealType || 'unknown',
        eligible: false,
        reason: 'Invalid event canteen QR code',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
      });

      return res.status(404).json({
        success: false,
        error: 'Invalid event canteen QR code',
      });
    }

    // Check if event is active
    if (!event.isActive) {
      // Log failed distribution attempt - event inactive
      await FoodDistributionLog.create({
        eventId: event._id,
        teamId: null,
        memberId: null,
        memberName: 'Unknown',
        memberEmail: 'Unknown',
        memberQRToken: memberQRToken,
        eventCanteenQR: eventCanteenQR,
        mealType: mealType || 'unknown',
        eligible: false,
        reason: 'Event is not active',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
      });

      return res.status(400).json({
        success: false,
        error: 'Event is not active',
      });
    }

    // Find member by QR token
    const result = await Team.findByMemberQR(memberQRToken);

    if (!result) {
      // Log failed distribution attempt - member not found
      await FoodDistributionLog.create({
        eventId: event._id,
        teamId: null,
        memberId: null,
        memberName: 'Unknown',
        memberEmail: 'Unknown',
        memberQRToken: memberQRToken,
        eventCanteenQR: eventCanteenQR,
        mealType: mealType || 'unknown',
        eligible: false,
        reason: 'Member not found with provided QR token',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
      });

      return res.status(404).json({
        success: false,
        error: 'Member not found with provided QR token',
      });
    }

    const { team, member } = result;

    // Verify member belongs to the scanned event
    if (team.eventId.toString() !== event._id.toString()) {
      // Log failed distribution attempt - wrong event
      await FoodDistributionLog.create({
        eventId: event._id,
        teamId: team._id,
        memberId: member._id,
        memberName: member.name,
        memberEmail: member.email,
        memberQRToken: memberQRToken,
        eventCanteenQR: eventCanteenQR,
        mealType: mealType || 'unknown',
        eligible: false,
        reason: 'Member does not belong to this event',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
      });

      return res.status(400).json({
        success: false,
        error: 'Member does not belong to this event',
        data: {
          member: {
            name: member.name,
            email: member.email,
          },
          event: {
            name: event.name,
          },
        },
      });
    }

    // Check if member is checked in
    if (!member.isCheckedIn) {
      // Log failed distribution attempt - not checked in
      await FoodDistributionLog.create({
        eventId: event._id,
        teamId: team._id,
        memberId: member._id,
        memberName: member.name,
        memberEmail: member.email,
        memberQRToken: memberQRToken,
        eventCanteenQR: eventCanteenQR,
        mealType: mealType || 'unknown',
        eligible: false,
        reason: 'Member must complete check-in first',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
      });

      return res.status(200).json({
        success: false,
        error: 'Member must complete check-in first',
        data: {
          member: {
            name: member.name,
            email: member.email,
          },
          event: {
            name: event.name,
          },
          isCheckedIn: false,
        },
      });
    }

    // Member is eligible - update food scan history
    member.foodScanHistory.push({
      scannedAt: new Date(),
      mealType: mealType || 'general',
      scannedBy: req.user._id,
      eligible: true,
    });

    await team.save();

    // Increment event stats atomically
    await Event.findByIdAndUpdate(event._id, {
      $inc: { 'stats.totalFoodDistributed': 1 },
    });

    // Create FoodDistributionLog entry for successful distribution
    await FoodDistributionLog.create({
      eventId: event._id,
      teamId: team._id,
      memberId: member._id,
      memberName: member.name,
      memberEmail: member.email,
      memberQRToken: memberQRToken,
      eventCanteenQR: eventCanteenQR,
      mealType: mealType || 'general',
      eligible: true,
      reason: 'Food distributed successfully',
      scannedAt: new Date(),
      scannedBy: req.user._id,
      scannedByName: req.user.name,
    });

    return res.status(200).json({
      success: true,
      message: 'Food distributed successfully',
      data: {
        member: {
          name: member.name,
          email: member.email,
          qrToken: member.qrToken,
        },
        event: {
          name: event.name,
          venue: event.venue,
        },
        distribution: {
          mealType: mealType || 'general',
          distributedAt: new Date(),
          distributedBy: req.user.name,
        },
        totalFoodScans: member.foodScanHistory.length,
      },
    });
  } catch (error) {
    console.error('Log food distribution error:', error);

    // Log failed distribution attempt for unexpected errors
    try {
      await FoodDistributionLog.create({
        eventId: null,
        teamId: null,
        memberId: null,
        memberName: 'Unknown',
        memberEmail: 'Unknown',
        memberQRToken: req.body.memberQRToken || 'Unknown',
        eventCanteenQR: req.body.eventCanteenQR || 'Unknown',
        mealType: req.body.mealType || 'unknown',
        eligible: false,
        reason: error.message || 'Error logging food distribution',
        scannedAt: new Date(),
        scannedBy: req.user?._id || null,
        scannedByName: req.user?.name || 'Unknown',
      });
    } catch (logError) {
      console.error('Failed to log food distribution error:', logError);
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Error logging food distribution',
    });
  }
};
