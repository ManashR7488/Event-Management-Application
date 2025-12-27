import mongoose from 'mongoose';
import crypto from 'crypto';

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Event name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Event slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
    },
    type: {
      type: String,
      enum: {
        values: ['hackathon', 'sports', 'cultural', 'technical', 'food'],
        message: '{VALUE} is not a valid event type',
      },
      default: 'hackathon',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
    },
    registrationFeePerMember: {
      type: Number,
      required: [true, 'Registration fee per member is required'],
      min: [0, 'Registration fee cannot be negative'],
      default: 0,
    },
    maxTeamSize: {
      type: Number,
      required: [true, 'Maximum team size is required'],
      min: [1, 'Maximum team size must be at least 1'],
      default: 4,
    },
    minTeamSize: {
      type: Number,
      required: [true, 'Minimum team size is required'],
      min: [1, 'Minimum team size must be at least 1'],
      default: 1,
    },
    maxTeams: {
      type: Number,
      min: [1, 'Maximum teams must be at least 1'],
    },
    canteenQRToken: {
      type: String,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    registrationOpen: {
      type: Boolean,
      default: true,
    },
    stats: {
      totalTeamsRegistered: {
        type: Number,
        default: 0,
      },
      totalMembersRegistered: {
        type: Number,
        default: 0,
      },
      totalCheckedIn: {
        type: Number,
        default: 0,
      },
      totalFoodDistributed: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
// eventSchema.index({ slug: 1 }, { unique: true });
// eventSchema.index({ canteenQRToken: 1 }, { unique: true });
eventSchema.index({ type: 1, isActive: 1 });

// Custom validators
eventSchema.path('endDate').validate(function (value) {
  return this.startDate && value > this.startDate;
}, 'End date must be after start date');

eventSchema.path('maxTeamSize').validate(function (value) {
  return value >= this.minTeamSize;
}, 'Maximum team size must be greater than or equal to minimum team size');

// Pre-save hook to generate canteenQRToken if not provided or if slug is modified
eventSchema.pre('save', async function () {
  if (!this.canteenQRToken || this.isModified('slug')) {
    if (!this.slug) {
      throw new Error('Slug is required to generate canteen QR token');
    }
    const uuid = crypto.randomUUID();
    this.canteenQRToken = `EVENT:${this.slug.toUpperCase()}:CANTEEN:${uuid}`;
  }
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
