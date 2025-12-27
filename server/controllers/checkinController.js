import { Team, CheckinLog, Event } from '../models/index.js';

/**
 * Scan member QR code and mark check-in
 * @route POST /api/checkin/scan
 * @access Staff only
 */
export const scanMemberQR = async (req, res) => {
  try {
    const { qrToken, eventId } = req.body;

    // Validate qrToken is provided
    if (!qrToken || typeof qrToken !== 'string' || qrToken.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid QR token',
      });
    }

    // Validate eventId is provided
    if (!eventId || typeof eventId !== 'string' || eventId.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Event ID is required',
      });
    }

    // Find member by QR token
    const result = await Team.findByMemberQR(qrToken);

    if (!result) {
      // Log failed scan attempt - member not found
      await CheckinLog.create({
        eventId: eventId,
        teamId: null,
        memberId: null,
        memberName: 'Unknown',
        memberEmail: 'Unknown',
        qrToken: qrToken,
        scanType: 'entry',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
        success: false,
        errorMessage: 'Member not found with provided QR token',
      });

      return res.status(404).json({
        success: false,
        error: 'Member not found with provided QR token',
      });
    }

    const { team, member } = result;

    // Validate member belongs to the selected event
    if (team.eventId.toString() !== eventId) {
      // Log failed scan attempt - wrong event
      await CheckinLog.create({
        eventId: eventId,
        teamId: team._id,
        memberId: member._id,
        memberName: member.name,
        memberEmail: member.email,
        qrToken: qrToken,
        scanType: 'entry',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
        success: false,
        errorMessage: 'Member not registered for this event',
      });

      return res.status(400).json({
        success: false,
        error: 'Member not registered for this event',
      });
    }

    // Check if member is already checked in (idempotent behavior)
    if (member.isCheckedIn) {
      // Log duplicate/idempotent scan attempt
      await CheckinLog.create({
        eventId: team.eventId,
        teamId: team._id,
        memberId: member._id,
        memberName: member.name,
        memberEmail: member.email,
        qrToken: qrToken,
        scanType: 'entry',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
        success: false,
        errorMessage: 'Member already checked in - duplicate scan',
      });

      return res.status(200).json({
        success: true,
        alreadyCheckedIn: true,
        message: 'Member already checked in',
        data: {
          member: {
            name: member.name,
            email: member.email,
            qrToken: member.qrToken,
            isCheckedIn: member.isCheckedIn,
          },
          team: {
            teamName: team.teamName,
            eventId: team.eventId,
          },
          checkInTime: member.checkInTime,
        },
      });
    }

    // Update member check-in status
    const updateResult = await Team.updateMemberCheckIn(qrToken, req.user._id);

    // Handle the case where updateMemberCheckIn returns alreadyCheckedIn flag
    // (concurrent scan that passed the initial check but was beaten by another request)
    if (updateResult.alreadyCheckedIn) {
      // Log concurrent duplicate scan attempt
      await CheckinLog.create({
        eventId: team.eventId,
        teamId: team._id,
        memberId: member._id,
        memberName: member.name,
        memberEmail: member.email,
        qrToken: qrToken,
        scanType: 'entry',
        scannedAt: new Date(),
        scannedBy: req.user._id,
        scannedByName: req.user.name,
        success: false,
        errorMessage: 'Member already checked in - concurrent duplicate scan',
      });

      return res.status(200).json({
        success: true,
        alreadyCheckedIn: true,
        message: 'Member already checked in',
        data: {
          member: {
            name: updateResult.member.name,
            email: updateResult.member.email,
            qrToken: updateResult.member.qrToken,
            isCheckedIn: updateResult.member.isCheckedIn,
          },
          team: {
            teamName: updateResult.team.teamName,
            eventId: updateResult.team.eventId,
          },
          checkInTime: updateResult.member.checkInTime,
        },
      });
    }

    // Create CheckinLog entry for successful check-in
    await CheckinLog.create({
      eventId: team.eventId,
      teamId: team._id,
      memberId: member._id,
      memberName: member.name,
      memberEmail: member.email,
      qrToken: qrToken,
      scanType: 'entry',
      scannedAt: new Date(),
      scannedBy: req.user._id,
      scannedByName: req.user.name,
      success: true,
    });

    // Update event stats atomically
    await Event.findByIdAndUpdate(team.eventId, {
      $inc: { 'stats.totalCheckedIn': 1 },
    });

    return res.status(200).json({
      success: true,
      message: 'Member checked in successfully',
      data: {
        member: {
          name: updateResult.member.name,
          email: updateResult.member.email,
          qrToken: updateResult.member.qrToken,
          isCheckedIn: updateResult.member.isCheckedIn,
        },
        team: {
          teamName: updateResult.team.teamName,
          eventId: updateResult.team.eventId,
        },
        checkInTime: updateResult.member.checkInTime,
      },
    });
  } catch (error) {
    console.error('Scan member QR error:', error);

    // Log failed scan attempt for unexpected errors
    try {
      await CheckinLog.create({
        eventId: null,
        teamId: null,
        memberId: null,
        memberName: 'Unknown',
        memberEmail: 'Unknown',
        qrToken: req.body.qrToken || 'Unknown',
        scanType: 'entry',
        scannedAt: new Date(),
        scannedBy: req.user?._id || null,
        scannedByName: req.user?.name || 'Unknown',
        success: false,
        errorMessage: error.message || 'Error processing check-in',
      });
    } catch (logError) {
      console.error('Failed to log check-in error:', logError);
    }

    return res.status(500).json({
      success: false,
      error: error.message || 'Error processing check-in',
    });
  }
};

/**
 * Get member check-in status by QR token
 * @route GET /api/checkin/status/:qrToken
 * @access All authenticated users
 */
export const getCheckInStatus = async (req, res) => {
  try {
    const { qrToken } = req.params;

    // Validate qrToken format
    if (!qrToken || typeof qrToken !== 'string' || qrToken.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid QR token',
      });
    }

    // Find member by QR token with populated event
    const result = await Team.findByMemberQR(qrToken);

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Member not found with provided QR token',
      });
    }

    const { team, member } = result;

    // Ensure event is populated
    const populatedTeam = await team.populate('eventId');

    return res.status(200).json({
      success: true,
      data: {
        isCheckedIn: member.isCheckedIn,
        checkInTime: member.checkInTime,
        memberName: member.name,
        teamName: team.teamName,
        eventName: populatedTeam.eventId.name,
      },
    });
  } catch (error) {
    console.error('Get check-in status error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error fetching check-in status',
    });
  }
};
