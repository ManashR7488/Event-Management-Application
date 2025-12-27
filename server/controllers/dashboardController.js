import mongoose from 'mongoose';
import Team from "../models/Team.js";
import Event from "../models/Event.js";
import CheckinLog from "../models/CheckinLog.js";
import FoodDistributionLog from "../models/FoodDistributionLog.js";
import { Parser } from "json2csv";

// @desc    Get aggregate statistics
// @route   GET /api/dashboard/stats
// @access  Private (Organizer/Admin)
export const getStats = async (req, res) => {
  try {
    const { eventId } = req.query;

    let filter = {};
    let eventDetails = null;
    let eventObjectId = null;

    if (eventId) {
      // Validate and convert eventId to ObjectId
      if (!mongoose.isValidObjectId(eventId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event ID format',
        });
      }

      eventObjectId = new mongoose.Types.ObjectId(eventId);
      filter.eventId = eventObjectId;

      // Get event details
      eventDetails = await Event.findById(eventObjectId).select(
        "name slug startDate endDate venue"
      );

      if (!eventDetails) {
        return res.status(404).json({
          success: false,
          error: "Event not found",
        });
      }
    }

    // Aggregate teams and members
    const teamStats = await Team.aggregate([
      ...(eventObjectId ? [{ $match: { eventId: eventObjectId } }] : []),
      {
        $group: {
          _id: null,
          totalTeams: { $sum: 1 },
          totalMembers: { $sum: { $size: "$members" } },
        },
      },
    ]);
    // console.log("team stat:", teamStats);
    // Count unique checked-in members
    const checkedInStats = await CheckinLog.aggregate([
      ...(eventObjectId ? [{ $match: { eventId: eventObjectId } }] : []),
      { $match: { success: true } },
      {
        $group: {
          _id: "$memberId",
        },
      },
      {
        $group: {
          _id: null,
          totalCheckedIn: { $sum: 1 },
        },
      },
    ]);

    // Count eligible food distributions
    const foodStats = await FoodDistributionLog.aggregate([
      ...(eventObjectId ? [{ $match: { eventId: eventObjectId } }] : []),
      { $match: { eligible: true } },
      {
        $group: {
          _id: null,
          totalFoodDistributed: { $sum: 1 },
        },
      },
    ]);

    const totalTeamsRegistered = teamStats[0]?.totalTeams || 0;
    const totalMembersRegistered = teamStats[0]?.totalMembers || 0;
    const totalCheckedIn = checkedInStats[0]?.totalCheckedIn || 0;
    const totalFoodDistributed = foodStats[0]?.totalFoodDistributed || 0;
    const checkInPercentage =
      totalMembersRegistered > 0
        ? ((totalCheckedIn / totalMembersRegistered) * 100).toFixed(2)
        : 0;

    let data = {
      totalTeamsRegistered,
      totalTeams: totalTeamsRegistered,
      totalMembersRegistered,
      totalMembers: totalMembersRegistered,
      totalCheckedIn,
      checkedInCount: totalCheckedIn,
      totalFoodDistributed,
      foodDistributed: totalFoodDistributed,
      checkInPercentage: parseFloat(checkInPercentage),
      ...(eventDetails && { eventDetails }),
    };
    // console.log(data);
    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error fetching statistics",
    });
  }
};

// @desc    Get teams list with filters and pagination
// @route   GET /api/dashboard/teams
// @access  Private (Organizer/Admin)
export const getTeams = async (req, res) => {
  try {
    const {
      eventId,
      page = 1,
      limit = 20,
      search,
      paymentStatus,
      checkInStatus,
    } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: "Event ID is required",
      });
    }

    // Validate and convert eventId to ObjectId
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format',
      });
    }

    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build aggregation pipeline
    const pipeline = [
      { $match: { eventId: eventObjectId } },
      {
        $addFields: {
          memberCount: { $size: "$members" },
          checkedInCount: {
            $size: {
              $filter: {
                input: "$members",
                as: "member",
                cond: { $eq: ["$$member.isCheckedIn", true] },
              },
            },
          },
        },
      },
    ];

    // Apply search filter
    if (search) {
      pipeline.push({
        $match: { teamName: { $regex: search, $options: "i" } },
      });
    }

    // Apply payment status filter
    if (paymentStatus) {
      pipeline.push({
        $match: { "paymentMetadata.status": paymentStatus },
      });
    }

    // Apply check-in status filter
    if (checkInStatus === "completed") {
      pipeline.push({
        $match: { $expr: { $eq: ["$memberCount", "$checkedInCount"] } },
      });
    } else if (checkInStatus === "partial") {
      pipeline.push({
        $match: {
          $expr: {
            $and: [
              { $gt: ["$checkedInCount", 0] },
              { $lt: ["$checkedInCount", "$memberCount"] },
            ],
          },
        },
      });
    } else if (checkInStatus === "none") {
      pipeline.push({
        $match: { $expr: { $eq: ["$checkedInCount", 0] } },
      });
    }

    // Get total count with filters applied
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Team.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    // Add sorting and pagination
    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    );

    // Execute aggregation
    const teams = await Team.aggregate(pipeline);

    // Populate eventId manually
    await Event.populate(teams, {
      path: "eventId",
      select: "name slug startDate endDate",
    });

    return res.status(200).json({
      success: true,
      data: {
        teams: teams.map((team) => ({
          _id: team._id,
          teamName: team.teamName,
          eventId: team.eventId,
          leadUserId: team.leadUserId,
          leadEmail: team.leadEmail,
          leadName: team.leadName,
          leadPhone: team.leadPhone,
          memberCount: team.memberCount,
          checkedInCount: team.checkedInCount,
          paymentMetadata: team.paymentMetadata,
          paymentStatus: team.paymentMetadata?.status || "pending",
          createdAt: team.createdAt,
          members: team.members,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get teams error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error fetching teams",
    });
  }
};

// @desc    Get attendance logs with filters and pagination
// @route   GET /api/dashboard/attendance
// @access  Private (Organizer/Admin)
export const getAttendanceLogs = async (req, res) => {
  try {
    const {
      eventId,
      page = 1,
      limit = 20,
      teamId,
      startDate,
      endDate,
      search,
    } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: "Event ID is required",
      });
    }

    // Validate and convert eventId to ObjectId
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format',
      });
    }

    const eventObjectId = new mongoose.Types.ObjectId(eventId);
    const filter = { eventId: eventObjectId };

    // Filter by team
    if (teamId) {
      if (!mongoose.isValidObjectId(teamId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid team ID format',
        });
      }
      filter.teamId = new mongoose.Types.ObjectId(teamId);
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.scannedAt = {};
      if (startDate) {
        filter.scannedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.scannedAt.$lte = new Date(endDate);
      }
    }

    // Search by member name or email
    if (search) {
      filter.$or = [
        { memberName: { $regex: search, $options: "i" } },
        { memberEmail: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get logs with pagination
    const logs = await CheckinLog.find(filter)
      .populate("teamId", "teamName eventId")
      .populate("scannedBy", "name email")
      .sort({ scannedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await CheckinLog.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error("Get attendance logs error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error fetching attendance logs",
    });
  }
};

// @desc    Get food distribution logs with filters and pagination
// @route   GET /api/dashboard/food
// @access  Private (Organizer/Admin)
export const getFoodLogs = async (req, res) => {
  try {
    const {
      eventId,
      page = 1,
      limit = 20,
      teamId,
      eligible,
      startDate,
      endDate,
      search,
    } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: "Event ID is required",
      });
    }

    // Validate and convert eventId to ObjectId
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format',
      });
    }

    const eventObjectId = new mongoose.Types.ObjectId(eventId);
    const filter = { eventId: eventObjectId };

    // Filter by team
    if (teamId) {
      if (!mongoose.isValidObjectId(teamId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid team ID format',
        });
      }
      filter.teamId = new mongoose.Types.ObjectId(teamId);
    }

    // Filter by eligibility status
    if (eligible !== undefined) {
      filter.eligible = eligible === "true";
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.scannedAt = {};
      if (startDate) {
        filter.scannedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.scannedAt.$lte = new Date(endDate);
      }
    }

    // Search by member name or email
    if (search) {
      filter.$or = [
        { memberName: { $regex: search, $options: "i" } },
        { memberEmail: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get logs with pagination
    const logs = await FoodDistributionLog.find(filter)
      .populate("teamId", "teamName eventId")
      .sort({ scannedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count
    const total = await FoodDistributionLog.countDocuments(filter);

    // Get summary counts using same filter as logs
    const summary = await FoodDistributionLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$eligible",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalEligible = summary.find((s) => s._id === true)?.count || 0;
    const totalIneligible = summary.find((s) => s._id === false)?.count || 0;

    return res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
        summary: {
          totalEligible,
          totalIneligible,
        },
      },
    });
  } catch (error) {
    console.error("Get food logs error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error fetching food distribution logs",
    });
  }
};

// @desc    Export attendance logs as CSV
// @route   GET /api/dashboard/export/attendance
// @access  Private (Organizer/Admin)
export const exportAttendanceCSV = async (req, res) => {
  try {
    const { eventId, teamId, startDate, endDate } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: "Event ID is required",
      });
    }

    // Validate and convert eventId to ObjectId
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format',
      });
    }

    const eventObjectId = new mongoose.Types.ObjectId(eventId);
    const filter = { eventId: eventObjectId };

    // Filter by team
    if (teamId) {
      if (!mongoose.isValidObjectId(teamId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid team ID format',
        });
      }
      filter.teamId = new mongoose.Types.ObjectId(teamId);
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.scannedAt = {};
      if (startDate) {
        filter.scannedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.scannedAt.$lte = new Date(endDate);
      }
    }

    // Get all logs without pagination
    const logs = await CheckinLog.find(filter)
      .populate("teamId", "teamName")
      .populate("eventId", "name")
      .populate("scannedBy", "name")
      .sort({ scannedAt: -1 });

    // Transform data for CSV
    const csvData = logs.map((log) => ({
      eventName: log.eventId?.name || "N/A",
      teamName: log.teamId?.teamName || "N/A",
      memberName: log.memberName,
      memberEmail: log.memberEmail,
      qrToken: log.qrToken,
      scannedAt: log.scannedAt.toISOString(),
      scannedByName: log.scannedBy?.name || log.scannedByName || "N/A",
      success: log.success,
      errorMessage: log.errorMessage || "",
    }));

    // Define CSV fields
    const fields = [
      { label: "Event Name", value: "eventName" },
      { label: "Team Name", value: "teamName" },
      { label: "Member Name", value: "memberName" },
      { label: "Member Email", value: "memberEmail" },
      { label: "QR Token", value: "qrToken" },
      { label: "Check-in Time", value: "scannedAt" },
      { label: "Scanned By", value: "scannedByName" },
      { label: "Success", value: "success" },
      { label: "Error Message", value: "errorMessage" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    // Set response headers
    res.header("Content-Type", "text/csv");
    res.attachment(`attendance-${eventId}-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Export attendance CSV error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error exporting attendance CSV",
    });
  }
};

// @desc    Export food distribution logs as CSV
// @route   GET /api/dashboard/export/food
// @access  Private (Organizer/Admin)
export const exportFoodCSV = async (req, res) => {
  try {
    const { eventId, teamId, eligible, startDate, endDate } = req.query;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        error: "Event ID is required",
      });
    }

    // Validate and convert eventId to ObjectId
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid event ID format',
      });
    }

    const eventObjectId = new mongoose.Types.ObjectId(eventId);
    const filter = { eventId: eventObjectId };

    // Filter by team
    if (teamId) {
      if (!mongoose.isValidObjectId(teamId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid team ID format',
        });
      }
      filter.teamId = new mongoose.Types.ObjectId(teamId);
    }

    // Filter by eligibility status
    if (eligible !== undefined) {
      filter.eligible = eligible === "true";
    }

    // Filter by date range
    if (startDate || endDate) {
      filter.scannedAt = {};
      if (startDate) {
        filter.scannedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.scannedAt.$lte = new Date(endDate);
      }
    }

    // Get all logs without pagination
    const logs = await FoodDistributionLog.find(filter)
      .populate("teamId", "teamName")
      .populate("eventId", "name")
      .sort({ scannedAt: -1 });

    // Transform data for CSV
    const csvData = logs.map((log) => ({
      eventName: log.eventId?.name || "N/A",
      teamName: log.teamId?.teamName || "N/A",
      memberName: log.memberName,
      memberEmail: log.memberEmail,
      memberQRToken: log.memberQRToken,
      eligible: log.eligible,
      reason: log.reason || "",
      scannedAt: log.scannedAt.toISOString(),
      mealType: log.mealType || "N/A",
      scannedByName: log.scannedByName || "N/A",
    }));

    // Define CSV fields
    const fields = [
      { label: "Event Name", value: "eventName" },
      { label: "Team Name", value: "teamName" },
      { label: "Member Name", value: "memberName" },
      { label: "Member Email", value: "memberEmail" },
      { label: "QR Token", value: "memberQRToken" },
      { label: "Eligible", value: "eligible" },
      { label: "Reason", value: "reason" },
      { label: "Scan Time", value: "scannedAt" },
      { label: "Meal Type", value: "mealType" },
      { label: "Scanned By", value: "scannedByName" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    // Set response headers
    res.header("Content-Type", "text/csv");
    res.attachment(`food-distribution-${eventId}-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Export food CSV error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error exporting food distribution CSV",
    });
  }
};
