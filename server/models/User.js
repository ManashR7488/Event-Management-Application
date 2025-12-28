import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return !v || /^[6-9]\d{9}$/.test(v);
        },
        message: 'Please provide a valid phone number',
      },
    },
    college: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: {
        values: ['teamLead', 'staff', 'organizer', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'teamLead',
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    memberIndex: {
      type: Number,
      default: null,
    },
    qrToken: {
      type: String,
      default: null,
      sparse: true, // Allow multiple null values, but unique non-null values
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ teamId: 1, memberIndex: 1 });
userSchema.index({ qrToken: 1 }, { unique: true, sparse: true });

// Pre-save hook to hash password before saving
userSchema.pre('save', async function () {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return;
  }

  // Generate salt
  const salt = await bcryptjs.genSalt(10);
  // Hash password
  this.password = await bcryptjs.hash(this.password, salt);
});

// Instance method for password comparison
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
