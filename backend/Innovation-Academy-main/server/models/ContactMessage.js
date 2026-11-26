import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      lowercase: true,
      trim: true,
    },
    subject: {
      type: String,
      default: 'General Inquiry / Program Expression',
      trim: true,
    },
    programOfInterest: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: [true, 'Please provide a message'],
    },
    status: {
      type: String,
      enum: ['Unread', 'Read', 'Replied', 'Archived'],
      default: 'Unread',
    },
    replyNotes: {
      type: String,
      default: '',
    },
    repliedAt: {
      type: Date,
      default: null,
    },
    conversation: [
      {
        sender: {
          type: String,
          enum: ['participant', 'admin'],
          default: 'participant',
        },
        senderName: {
          type: String,
          default: '',
        },
        message: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;

