import mongoose from 'mongoose';

const workshopSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a workshop title'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    programId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',
      required: [true, 'Workshop must belong to a parent program'],
    },
    programSlug: {
      type: String,
      required: true,
    },
    programTitle: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      required: [true, 'Please provide workshop date'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time'],
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time'],
    },
    venue: {
      type: String,
      required: [true, 'Please provide a venue or meeting link'],
      default: 'TRACE Expert City, Bay 05, Maradana',
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    meetingLink: {
      type: String,
      default: '',
    },
    speakerName: {
      type: String,
      required: [true, 'Please provide speaker name'],
    },
    speakerDescription: {
      type: String,
      default: '',
    },
    speakerAvatar: {
      type: String,
      default: '',
    },
    topicsCovered: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    additionalInstructions: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
      default: 'Upcoming',
    },
    capacity: {
      type: Number,
      default: 50,
    },
    rsvps: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly look up workshops by program
workshopSchema.index({ programId: 1, status: 1 });
workshopSchema.index({ programSlug: 1, slug: 1 }, { unique: true });

const Workshop = mongoose.model('Workshop', workshopSchema);
export default Workshop;

