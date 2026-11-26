import mongoose from 'mongoose';

const visitRequestSchema = new mongoose.Schema(
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
      default: null,
    },
    organizationName: {
      type: String,
      required: [true, 'Please provide organization name'],
      trim: true,
    },
    organizationType: {
      type: String,
      required: [true, 'Please provide organization type'],
      trim: true,
    },
    contactPerson: {
      type: String,
      required: [true, 'Please provide contact person name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
    },
    numberOfParticipants: {
      type: Number,
      required: [true, 'Please provide number of participants'],
      min: [1, 'Number of participants must be at least 1'],
    },
    participantAgeGroup: {
      type: String,
      required: [true, 'Please select participant age group'],
    },
    preferredVisitDate: {
      type: String,
      required: [true, 'Please provide preferred visit date'],
    },
    preferredTime: {
      type: String,
      required: [true, 'Please provide preferred time slot'],
    },
    visitPurpose: {
      type: String,
      required: [true, 'Please describe visit purpose'],
    },
    areasOfInterest: {
      type: [String],
      default: [],
    },
    additionalRequirements: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    allocatedHost: {
      type: String,
      default: 'TRACE Expert City Secretariat',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const VisitRequest = mongoose.model('VisitRequest', visitRequestSchema);
export default VisitRequest;

