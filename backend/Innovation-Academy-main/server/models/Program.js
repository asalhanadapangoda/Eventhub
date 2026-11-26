import mongoose from 'mongoose';

const programSchema = new mongoose.Schema(
  {
    programId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a program title'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    badge: {
      type: String,
      default: 'FLAGSHIP PROGRAM',
    },
    icon: {
      type: String,
      default: 'brain',
    },
    shortDescription: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    coverImage: {
      type: String,
      default: '',
    },
    objectives: {
      type: [String],
      default: [],
    },
    targetAudience: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      default: '1 Month',
    },
    fee: {
      type: String,
      default: '',
    },
    benefits: {
      type: [String],
      default: [],
    },
    activities: {
      type: [String],
      default: [],
    },
    learningOutcomes: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    coordinator: {
      name: { type: String, default: 'Dilshan Perera' },
      email: { type: String, default: 'projects@trace.lk' },
      title: { type: String, default: 'Head of Programs & Incubation' },
      phone: { type: String, default: '+94 70 151 0444' },
    },
    status: {
      type: String,
      enum: ['Active', 'Upcoming', 'Archived'],
      default: 'Active',
    },
    featured: {
      type: Boolean,
      default: true,
    },
    enrollmentOpen: {
      type: Boolean,
      default: true,
    },
    totalSeats: {
      type: Number,
      default: 50,
    },
    cohort: {
      type: String,
      default: 'Cohort 12 (2025/Q2)',
    },
  },
  {
    timestamps: true,
  }
);

const Program = mongoose.model('Program', programSchema);
export default Program;

