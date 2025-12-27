import mongoose from 'mongoose';

const checkinLogSchema = new mongoose.Schema(
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
    qrToken: {
      type: String,
      required: [true, 'QR token is required'],
    },
    scanType: {
      type: String,
      enum: {
        values: ['entry'],
        message: '{VALUE} is not a valid scan type',
      },
      default: 'entry',
    },
    scannedAt: {
      type: Date,
      required: [true, 'Scanned at timestamp is required'],
      default: Date.now,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Scanned by user ID is required'],
    },
    scannedByName: {
      type: String,
      trim: true,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
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
checkinLogSchema.index({ eventId: 1, scannedAt: 1 });
checkinLogSchema.index({ teamId: 1 });
checkinLogSchema.index({ qrToken: 1 });
checkinLogSchema.index({ scannedBy: 1 });

const CheckinLog = mongoose.model('CheckinLog', checkinLogSchema);

export default CheckinLog;
