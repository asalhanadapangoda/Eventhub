import mongoose from 'mongoose';

const programRegistrationSchema = new mongoose.Schema(
  {
    referenceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: true,
    },
    programSlug: {
      type: String,
      required: true,
    },
    programTitle: {
      type: String,
      required: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    additionalInformation: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Active'],
      default: 'Approved', // Auto-approves to grant immediate workshop access per business logic
    },
    reviewedBy: {
      type: String,
      default: 'Dilshan Perera (Head of Admissions)',
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate registrations for the same user and program
programRegistrationSchema.index({ userId: 1, programId: 1 }, { unique: true });

const ProgramRegistration = mongoose.model(
  'ProgramRegistration',
  programRegistrationSchema
);
export default ProgramRegistration;

