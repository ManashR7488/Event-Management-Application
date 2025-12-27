import mongoose from 'mongoose';

const foodDistributionLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: false,
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      required: false,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    memberName: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    memberEmail: {
      type: String,
      required: [true, 'Member email is required'],
      lowercase: true,
      trim: true,
    },
    memberQRToken: {
      type: String,
      required: [true, 'Member QR token is required'],
    },
    eventCanteenQR: {
      type: String,
      required: [true, 'Event canteen QR is required'],
    },
    eligible: {
      type: Boolean,
      required: [true, 'Eligibility status is required'],
    },
    reason: {
      type: String,
      trim: true,
    },
    scannedAt: {
      type: Date,
      required: [true, 'Scanned at timestamp is required'],
      default: Date.now,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    mealType: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    strict: true,
  }
);

// Indexes
foodDistributionLogSchema.index({ eventId: 1, scannedAt: 1 });
foodDistributionLogSchema.index({ teamId: 1 });
foodDistributionLogSchema.index({ memberQRToken: 1 });
foodDistributionLogSchema.index({ eligible: 1 });

const FoodDistributionLog = mongoose.model(
  'FoodDistributionLog',
  foodDistributionLogSchema
);

export default FoodDistributionLog;
