import mongoose from 'mongoose';
import ContactMessage from '../models/ContactMessage.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { mockStore } from '../config/mockStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Submit contact message from homepage
export const submitContactMessage = async (req, res, next) => {
  try {
    let { name, email, subject, programOfInterest, message, userId } = req.body;

    if (req.user) {
      name = name || req.user.name;
      email = email || req.user.email;
      userId = userId || req.user._id || req.user.id;
    }

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message.',
      });
    }

    const cleanMessageText = message.replace(/^\[Follow-up Reply\]:\s*/i, '').trim();

    if (isDbConnected()) {
      let resolvedUserId = userId || (req.user ? (req.user._id || req.user.id) : null);
      if (!resolvedUserId) {
        const foundUser = await User.findOne({ email: email.toLowerCase() });
        if (foundUser) resolvedUserId = foundUser._id;
      }

      // Check if an existing contact message thread already exists for this user/email
      let existing = await ContactMessage.findOne({
        $or: [
          resolvedUserId ? { userId: resolvedUserId } : null,
          { email: email.toLowerCase() },
        ].filter(Boolean),
      }).sort({ createdAt: -1 });

      if (existing) {
        if (!Array.isArray(existing.conversation) || existing.conversation.length === 0) {
          existing.conversation = [
            {
              sender: 'participant',
              senderName: existing.name,
              message: existing.message.replace(/^\[Follow-up Reply\]:\s*/i, '').trim(),
              createdAt: existing.createdAt || new Date(),
            },
          ];
          if (existing.replyNotes) {
            existing.conversation.push({
              sender: 'admin',
              senderName: 'TRACE Secretariat',
              message: existing.replyNotes,
              createdAt: existing.repliedAt || new Date(),
            });
          }
        }

        existing.conversation.push({
          sender: 'participant',
          senderName: name,
          message: cleanMessageText,
          createdAt: new Date(),
        });
        existing.status = 'Unread';
        existing.message = cleanMessageText;
        if (subject) existing.subject = subject;
        if (programOfInterest) existing.programOfInterest = programOfInterest;
        await existing.save();

        return res.status(200).json({
          success: true,
          data: existing,
          message: 'Thank you for contacting TRACE Sri Lanka! Our innovation team has received your message.',
        });
      }

      const contact = await ContactMessage.create({
        userId: resolvedUserId,
        name,
        email: email.toLowerCase(),
        subject: subject || 'General Inquiry / Program Expression',
        programOfInterest: programOfInterest || '',
        message: cleanMessageText,
        status: 'Unread',
        conversation: [
          {
            sender: 'participant',
            senderName: name,
            message: cleanMessageText,
            createdAt: new Date(),
          },
        ],
      });
      return res.status(201).json({
        success: true,
        data: contact,
        message: 'Thank you for contacting TRACE Sri Lanka! Our innovation team has received your message.',
      });
    }

    // In-memory fallback
    let fallbackUserId = userId || (req.user ? (req.user._id || req.user.id) : null);
    if (!fallbackUserId) {
      const foundMockUser = mockStore.users.find(
        (u) => u.email && u.email.toLowerCase() === email.toLowerCase()
      );
      if (foundMockUser) fallbackUserId = foundMockUser._id || foundMockUser.id;
    }

    let existingMock = mockStore.contactMessages.find(
      (m) =>
        (fallbackUserId && (m.userId === fallbackUserId || m.id === fallbackUserId)) ||
        (m.email && m.email.toLowerCase() === email.toLowerCase())
    );

    if (existingMock) {
      if (!Array.isArray(existingMock.conversation) || existingMock.conversation.length === 0) {
        existingMock.conversation = [
          {
            sender: 'participant',
            senderName: existingMock.name,
            message: existingMock.message.replace(/^\[Follow-up Reply\]:\s*/i, '').trim(),
            createdAt: existingMock.createdAt || new Date(),
          },
        ];
        if (existingMock.replyNotes) {
          existingMock.conversation.push({
            sender: 'admin',
            senderName: 'TRACE Secretariat',
            message: existingMock.replyNotes,
            createdAt: existingMock.repliedAt || new Date(),
          });
        }
      }

      existingMock.conversation.push({
        sender: 'participant',
        senderName: name,
        message: cleanMessageText,
        createdAt: new Date(),
      });
      existingMock.status = 'Unread';
      existingMock.message = cleanMessageText;

      return res.status(200).json({
        success: true,
        data: existingMock,
        message: 'Thank you for contacting TRACE Sri Lanka! Our innovation team has received your message.',
      });
    }

    const newMsg = {
      _id: `mock_cnt_${Date.now()}`,
      id: `mock_cnt_${Date.now()}`,
      userId: fallbackUserId,
      name,
      email: email.toLowerCase(),
      subject: subject || 'General Inquiry / Program Expression',
      programOfInterest: programOfInterest || '',
      message: cleanMessageText,
      status: 'Unread',
      conversation: [
        {
          sender: 'participant',
          senderName: name,
          message: cleanMessageText,
          createdAt: new Date(),
        },
      ],
      createdAt: new Date(),
    };

    mockStore.contactMessages.unshift(newMsg);
    res.status(201).json({
      success: true,
      data: newMsg,
      message: 'Thank you for contacting TRACE Sri Lanka! Our innovation team has received your message.',
    });
  } catch (error) {
    next(error);
  }
};

// Consolidate messages so all messages from the same participant appear in a single unified thread
export const groupMessagesBySender = (rawMessages) => {
  if (!Array.isArray(rawMessages)) return [];
  const map = new Map();

  for (const doc of rawMessages) {
    const msg = doc.toObject ? doc.toObject() : { ...doc };
    const emailKey = (msg.email || '').toLowerCase().trim();
    const key = emailKey || (msg.userId ? String(msg.userId) : String(msg._id || msg.id));

    if (!map.has(key)) {
      let conv = Array.isArray(msg.conversation) && msg.conversation.length > 0
        ? [...msg.conversation]
        : [];

      if (conv.length === 0) {
        if (msg.message) {
          conv.push({
            sender: 'participant',
            senderName: msg.name,
            message: msg.message.replace(/^\[Follow-up Reply\]:\s*/i, '').trim(),
            createdAt: msg.createdAt,
          });
        }
        if (msg.replyNotes) {
          conv.push({
            sender: 'admin',
            senderName: 'TRACE Secretariat',
            message: msg.replyNotes,
            createdAt: msg.repliedAt || msg.updatedAt || msg.createdAt,
          });
        }
      }

      map.set(key, {
        ...msg,
        conversation: conv,
      });
    } else {
      const existing = map.get(key);

      let otherConv = Array.isArray(msg.conversation) && msg.conversation.length > 0
        ? [...msg.conversation]
        : [];

      if (otherConv.length === 0) {
        if (msg.message) {
          otherConv.push({
            sender: 'participant',
            senderName: msg.name,
            message: msg.message.replace(/^\[Follow-up Reply\]:\s*/i, '').trim(),
            createdAt: msg.createdAt,
          });
        }
        if (msg.replyNotes) {
          otherConv.push({
            sender: 'admin',
            senderName: 'TRACE Secretariat',
            message: msg.replyNotes,
            createdAt: msg.repliedAt || msg.updatedAt || msg.createdAt,
          });
        }
      }

      // Combine conversations
      existing.conversation = [...existing.conversation, ...otherConv].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      // Status: if any message is Unread, thread is Unread
      if (msg.status === 'Unread' || existing.status === 'Unread') {
        existing.status = 'Unread';
      }

      if (msg.programOfInterest && !existing.programOfInterest) {
        existing.programOfInterest = msg.programOfInterest;
      }

      // Update latest message text preview
      const last = existing.conversation[existing.conversation.length - 1];
      if (last) {
        existing.message = last.message;
      }
    }
  }

  return Array.from(map.values());
};

// @desc    Get all contact messages (admin)
export const getAllContactMessages = async (req, res, next) => {
  try {
    const { status } = req.query;

    if (isDbConnected()) {
      const filter = status ? { status } : {};
      const rawMessages = await ContactMessage.find(filter).sort({ createdAt: -1 });
      const messages = groupMessagesBySender(rawMessages);
      return res.json({ success: true, count: messages.length, data: messages });
    }

    let list = groupMessagesBySender(mockStore.contactMessages);
    if (status) list = list.filter((m) => m.status === status);
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact message status (admin)
export const updateContactMessageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, replyNotes } = req.body;

    if (isDbConnected()) {
      const contact = await ContactMessage.findById(id);
      if (!contact) {
        return res.status(404).json({ success: false, message: 'Message not found' });
      }
      if (status) contact.status = status;
      if (replyNotes !== undefined && replyNotes.trim()) {
        contact.replyNotes = replyNotes.trim();
        contact.repliedAt = new Date();
        if (!Array.isArray(contact.conversation) || contact.conversation.length === 0) {
          contact.conversation = [
            {
              sender: 'participant',
              senderName: contact.name,
              message: contact.message,
              createdAt: contact.createdAt || new Date(),
            },
          ];
        }
        contact.conversation.push({
          sender: 'admin',
          senderName: 'TRACE Secretariat',
          message: replyNotes.trim(),
          createdAt: new Date(),
        });
      }
      await contact.save();

      // Dispatch Notification to the participant if a reply was written
      if (replyNotes && replyNotes.trim()) {
        try {
          let participantUser = contact.userId ? await User.findById(contact.userId) : null;
          if (!participantUser) {
            participantUser = await User.findOne({ email: contact.email.toLowerCase() });
          }

          if (participantUser) {
            await Notification.create({
              userId: participantUser._id,
              title: `Admin Reply: ${contact.subject || 'Inquiry'}`,
              message: `TRACE Secretariat: "${replyNotes.trim()}"`,
              type: 'info',
              link: `/participant/notifications`,
              read: false,
            });
          }
        } catch (notifErr) {
          console.warn('Failed to dispatch notification for contact reply:', notifErr.message);
        }
      }

      return res.json({ success: true, data: contact, message: 'Message updated successfully' });
    }

    const msg = mockStore.contactMessages.find((m) => m._id === id || m.id === id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    if (status) msg.status = status;
    if (replyNotes !== undefined && replyNotes.trim()) {
      msg.replyNotes = replyNotes.trim();
      msg.repliedAt = new Date();
      if (!Array.isArray(msg.conversation) || msg.conversation.length === 0) {
        msg.conversation = [
          {
            sender: 'participant',
            senderName: msg.name,
            message: msg.message,
            createdAt: msg.createdAt || new Date(),
          },
        ];
      }
      msg.conversation.push({
        sender: 'admin',
        senderName: 'TRACE Secretariat',
        message: replyNotes.trim(),
        createdAt: new Date(),
      });
    }

    // In-memory fallback
    if (replyNotes && replyNotes.trim()) {
      const mockUser = mockStore.users.find(
        (u) =>
          (msg.userId && (u._id === msg.userId || u.id === msg.userId)) ||
          (u.email && u.email.toLowerCase() === msg.email.toLowerCase())
      );
      mockStore.notifications.unshift({
        _id: `mock_notif_${Date.now()}`,
        id: `mock_notif_${Date.now()}`,
        userId: mockUser ? (mockUser._id || mockUser.id) : null,
        title: `Admin Reply: ${msg.subject || 'Inquiry'}`,
        message: `TRACE Secretariat: "${replyNotes.trim()}"`,
        type: 'info',
        link: '/participant/notifications',
        read: false,
        createdAt: new Date(),
      });
    }

    res.json({ success: true, data: msg, message: 'Message updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in participant's contact messages & replies
export const getMyContactMessages = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase() : '';

    if (isDbConnected()) {
      const rawMessages = await ContactMessage.find({
        $or: [
          { userId: userId },
          { email: userEmail },
        ],
      }).sort({ createdAt: -1 });

      const messages = groupMessagesBySender(rawMessages);
      return res.json({ success: true, count: messages.length, data: messages });
    }

    const list = mockStore.contactMessages.filter(
      (m) =>
        (m.userId && m.userId.toString() === userId.toString()) ||
        (m.email && m.email.toLowerCase() === userEmail)
    );
    const consolidated = groupMessagesBySender(list);
    res.json({ success: true, count: consolidated.length, data: consolidated });
  } catch (error) {
    next(error);
  }
};

// @desc    Participant sends a follow-up reply in the inquiry thread
export const participantReplyContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { replyMessage, subject, programOfInterest } = req.body;
    const userId = req.user.id || req.user._id;
    const userEmail = req.user.email ? req.user.email.toLowerCase() : '';

    if (!replyMessage || !replyMessage.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your reply message.' });
    }

    if (isDbConnected()) {
      let contact = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        contact = await ContactMessage.findById(id);
      }

      // If not found by direct ID, check if 'id' was a Notification ID
      if (!contact) {
        let notif = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
          notif = await Notification.findById(id);
        }

        const searchSubject = subject || (notif ? notif.title.replace(/^Admin Reply:\s*/i, '').trim() : '');

        if (searchSubject) {
          contact = await ContactMessage.findOne({
            $or: [{ userId }, { email: userEmail }],
            $and: [
              {
                $or: [
                  { subject: { $regex: searchSubject, $options: 'i' } },
                  { programOfInterest: { $regex: searchSubject, $options: 'i' } },
                ],
              },
            ],
          }).sort({ updatedAt: -1 });
        }

        if (!contact) {
          // Find latest contact message by this user
          contact = await ContactMessage.findOne({
            $or: [{ userId }, { email: userEmail }],
          }).sort({ createdAt: -1 });
        }

        if (!contact) {
          // Create a brand new ContactMessage record for this conversation thread
          contact = await ContactMessage.create({
            userId,
            name: req.user.name || 'Participant',
            email: userEmail,
            subject: searchSubject || 'General Inquiry / Program Expression',
            programOfInterest: programOfInterest || searchSubject || '',
            message: notif ? notif.message : 'Inquiry via Communication Desk',
            status: 'Unread',
            conversation: [],
          });
        }
      }

      if (!Array.isArray(contact.conversation) || contact.conversation.length === 0) {
        contact.conversation = [
          {
            sender: 'participant',
            senderName: contact.name,
            message: contact.message,
            createdAt: contact.createdAt || new Date(),
          },
        ];
        if (contact.replyNotes) {
          contact.conversation.push({
            sender: 'admin',
            senderName: 'TRACE Secretariat',
            message: contact.replyNotes,
            createdAt: contact.repliedAt || new Date(),
          });
        }
      }

      contact.conversation.push({
        sender: 'participant',
        senderName: req.user.name || contact.name,
        message: replyMessage.trim(),
        createdAt: new Date(),
      });

      // Mark status as Unread so admin sees participant's new reply
      contact.status = 'Unread';
      await contact.save();

      return res.json({
        success: true,
        data: contact,
        message: 'Your reply has been sent to TRACE Secretariat!',
      });
    }

    // MockStore fallback
    let msg = mockStore.contactMessages.find((m) => m._id === id || m.id === id);
    if (!msg) {
      msg = mockStore.contactMessages.find(
        (m) =>
          (m.userId && m.userId.toString() === userId.toString()) ||
          (m.email && m.email.toLowerCase() === userEmail)
      );
    }

    if (!msg) {
      msg = {
        _id: `mock_cnt_${Date.now()}`,
        id: `mock_cnt_${Date.now()}`,
        userId,
        name: req.user.name || 'Participant',
        email: userEmail,
        subject: subject || 'General Inquiry',
        message: 'Inquiry via Communication Desk',
        status: 'Unread',
        conversation: [],
        createdAt: new Date(),
      };
      mockStore.contactMessages.unshift(msg);
    }

    if (!Array.isArray(msg.conversation) || msg.conversation.length === 0) {
      msg.conversation = [
        {
          sender: 'participant',
          senderName: msg.name,
          message: msg.message,
          createdAt: msg.createdAt || new Date(),
        },
      ];
      if (msg.replyNotes) {
        msg.conversation.push({
          sender: 'admin',
          senderName: 'TRACE Secretariat',
          message: msg.replyNotes,
          createdAt: msg.repliedAt || new Date(),
        });
      }
    }

    msg.conversation.push({
      sender: 'participant',
      senderName: req.user.name || msg.name,
      message: replyMessage.trim(),
      createdAt: new Date(),
    });
    msg.status = 'Unread';

    res.json({
      success: true,
      data: msg,
      message: 'Your reply has been sent to TRACE Secretariat!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact message (admin)
export const deleteContactMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      await ContactMessage.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Contact message deleted successfully' });
    }

    mockStore.contactMessages = mockStore.contactMessages.filter((m) => m._id !== id && m.id !== id);
    res.json({ success: true, message: 'Contact message deleted successfully' });
  } catch (error) {
    next(error);
  }
};
