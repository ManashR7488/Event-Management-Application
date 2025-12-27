import mongoose from 'mongoose';
import crypto from 'crypto';

// Member subdocument schema
const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Member email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    college: {
      type: String,
      required: [true, 'College is required'],
      trim: true,
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
    },
    qrToken: {
      type: String,
    },
    qrImageUrl: {
      type: String,
    },
    isCheckedIn: {
      type: Boolean,
      default: false,
    },
    checkInTime: {
      type: Date,
    },
    foodScanHistory: [
      {
        scannedAt: {
          type: Date,
          required: true,
        },
        mealType: {
          type: String,
        },
        scannedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        eligible: {
          type: Boolean,
          required: true,
        },
      },
    ],
  },
  {
    _id: true,
  }
);

// Team schema
const teamSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
    },
    leadUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Team lead user ID is required'],
    },
    leadEmail: {
      type: String,
      required: [true, 'Team lead email is required'],
      lowercase: true,
      trim: true,
    },
    leadName: {
      type: String,
      required: [true, 'Team lead name is required'],
      trim: true,
    },
    leadPhone: {
      type: String,
      trim: true,
    },
    members: [memberSchema],
    paymentMetadata: {
      totalAmount: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: {
          values: ['pending', 'completed', 'failed'],
          message: '{VALUE} is not a valid payment status',
        },
        default: 'pending',
      },
      stripePaymentIntentId: {
        type: String,
      },
      paidAt: {
        type: Date,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
teamSchema.index({ eventId: 1, teamName: 1 }, { unique: true });
teamSchema.index({ eventId: 1, leadUserId: 1 }, { unique: true });
teamSchema.index({ leadUserId: 1 });
teamSchema.index({ 'members.qrToken': 1 });
teamSchema.index({ 'members.email': 1 });

// Virtual field: memberCount
teamSchema.virtual('memberCount').get(function () {
  return this.members.length;
});

// Virtual field: checkedInCount
teamSchema.virtual('checkedInCount').get(function () {
  return this.members.filter((member) => member.isCheckedIn).length;
});

// Pre-save hook: Generate QR tokens for members and calculate payment
teamSchema.pre('save', async function () {
  // Fetch event to get slug and registration fee
  const Event = mongoose.model('Event');
  const event = await Event.findById(this.eventId);

  if (!event) {
    throw new Error('Event not found');
  }

  // Validate team size
  if (this.members.length < event.minTeamSize) {
    throw new Error(
      `Team must have at least ${event.minTeamSize} member(s)`
    );
  }

  if (this.members.length > event.maxTeamSize) {
    throw new Error(
      `Team cannot have more than ${event.maxTeamSize} member(s)`
    );
  }

  // Check for duplicate emails in members array
  const emails = this.members.map((m) => m.email);
  const uniqueEmails = new Set(emails);
  if (emails.length !== uniqueEmails.size) {
    throw new Error('Duplicate member emails are not allowed');
  }

  // Generate QR tokens for members if not provided
  this.members.forEach((member, index) => {
    if (!member.qrToken) {
      const randomString = crypto.randomBytes(4).toString('hex');
      member.qrToken = `${event.slug.toUpperCase()}_T${this._id}_M${index}_${randomString}`;
    }
  });

  // Check for duplicate QR tokens in members array
  const qrTokens = this.members.map((m) => m.qrToken);
  const uniqueQrTokens = new Set(qrTokens);
  if (qrTokens.length !== uniqueQrTokens.size) {
    throw new Error('Duplicate member QR tokens are not allowed');
  }

  // Calculate payment amount
  this.paymentMetadata.totalAmount =
    this.members.length * event.registrationFeePerMember;
});

// Static method: Find team and member by QR token
teamSchema.statics.findByMemberQR = async function (qrToken) {
  const team = await this.findOne({ 'members.qrToken': qrToken });

  if (!team) {
    return null;
  }

  const member = team.members.find((m) => m.qrToken === qrToken);

  return { team, member };
};

// Static method: Update member check-in status
teamSchema.statics.updateMemberCheckIn = async function (qrToken, staffId) {
  const result = await this.findByMemberQR(qrToken);

  if (!result) {
    throw new Error('Member not found');
  }

  const { team, member } = result;

  if (member.isCheckedIn) {
    return { team, member, alreadyCheckedIn: true };
  }

  member.isCheckedIn = true;
  member.checkInTime = new Date();

  await team.save();

  return { team, member };
};

// Ensure virtuals are included in JSON and object outputs
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

const Team = mongoose.model('Team', teamSchema);

export default Team;
