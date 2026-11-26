import mongoose from 'mongoose';
import ProgramRegistration from '../models/ProgramRegistration.js';
import Program from '../models/Program.js';
import Notification from '../models/Notification.js';
import { sendProgramRegistrationEmail } from '../utils/emailService.js';
import { mockStore } from '../config/mockStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

const generateRefNumber = () => {
  const random = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `REG-TRC-${year}-${random}`;
};

// @desc    Register for a program
export const registerProgram = async (req, res, next) => {
  try {
    const { programId, programSlug, fullName, email, phoneNumber, organization, additionalInformation } = req.body;
    const userId = req.user.id || req.user._id;

    if (isDbConnected()) {
      let program;
      if (programId) {
        program = await Program.findById(programId);
      } else if (programSlug) {
        program = await Program.findOne({ slug: programSlug });
      }

      if (!program) {
        return res.status(404).json({
          success: false,
          message: 'Program not found. Please choose a valid TRACE Program.',
        });
      }

      // Check for duplicate registration
      const existingRegistration = await ProgramRegistration.findOne({
        userId,
        programId: program._id,
      });

      if (existingRegistration) {
        return res.status(400).json({
          success: false,
          message: `You are already registered for ${program.title}. Reference: ${existingRegistration.referenceNumber}`,
          existingRegistration,
        });
      }

      let referenceNumber = generateRefNumber();
      const registration = await ProgramRegistration.create({
        referenceNumber,
        userId,
        programId: program._id,
        programSlug: program.slug,
        programTitle: program.title,
        fullName: fullName || req.user.name,
        email: email ? email.toLowerCase() : req.user.email,
        phoneNumber: phoneNumber || req.user.phone || '',
        organization: organization || req.user.organization || '',
        additionalInformation: additionalInformation || '',
        status: 'Approved',
        reviewedBy: 'TRACE Admissions Automation',
      });

      sendProgramRegistrationEmail(registration, program).catch(() => {});

      return res.status(201).json({
        success: true,
        message: `Successfully registered for ${program.title}! You now have automatic access to all workshops in this program.`,
        data: registration,
        referenceNumber: registration.referenceNumber,
      });
    }

    // In-memory fallback
    const program = mockStore.programs.find(
      (p) => p._id === programId || p.id === programId || p.slug === programSlug
    );
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    // Duplicate check
    const existing = mockStore.programRegistrations.find(
      (r) =>
        (r.userId === userId || r.email.toLowerCase() === req.user.email.toLowerCase()) &&
        (r.programId === program._id || r.programId === program.id || r.programSlug === program.slug)
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You are already registered for ${program.title}. Reference: ${existing.referenceNumber}`,
        existingRegistration: existing,
      });
    }

    const referenceNumber = generateRefNumber();
    const newReg = {
      _id: `mock_reg_${Date.now()}`,
      id: `mock_reg_${Date.now()}`,
      referenceNumber,
      userId,
      programId: program._id || program.id,
      programSlug: program.slug,
      programTitle: program.title,
      fullName: fullName || req.user.name,
      email: email ? email.toLowerCase() : req.user.email,
      phoneNumber: phoneNumber || req.user.phone || '',
      organization: organization || req.user.organization || '',
      additionalInformation: additionalInformation || '',
      status: 'Approved',
      reviewedBy: 'TRACE Admissions Automation',
      createdAt: new Date(),
    };

    mockStore.programRegistrations.push(newReg);

    // Add notification
    mockStore.notifications.unshift({
      _id: `mock_notif_${Date.now()}`,
      userId,
      title: `Registration Confirmed: ${program.title}`,
      message: `Your registration (Ref: ${referenceNumber}) has been approved. You now have automatic access to all workshops in this program.`,
      type: 'success',
      link: '/participant/workshops',
      read: false,
      createdAt: new Date(),
    });

    sendProgramRegistrationEmail(newReg, program).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Successfully registered for ${program.title}! You now have automatic access to all workshops in this program.`,
      data: newReg,
      referenceNumber: newReg.referenceNumber,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user registrations
export const getMyRegistrations = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    if (isDbConnected()) {
      const registrations = await ProgramRegistration.find({ userId })
        .populate('programId')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: registrations.length, data: registrations });
    }

    const list = mockStore.programRegistrations.filter(
      (r) => r.userId === userId || r.email.toLowerCase() === req.user.email?.toLowerCase()
    );

    const enriched = list.map((r) => {
      const prog = mockStore.programs.find(
        (p) => p._id === r.programId || p.id === r.programId || p.slug === r.programSlug
      );
      return {
        ...r,
        programId: prog || null,
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations (admin)
export const getAllRegistrations = async (req, res, next) => {
  try {
    const { programSlug, status, search } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (programSlug) query.programSlug = programSlug;
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { referenceNumber: { $regex: search, $options: 'i' } },
        ];
      }
      const registrations = await ProgramRegistration.find(query)
        .populate('userId', 'name email avatar phone organization')
        .populate('programId', 'title slug badge coverImage')
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: registrations.length, data: registrations });
    }

    let list = [...mockStore.programRegistrations];
    if (programSlug) list = list.filter((r) => r.programSlug === programSlug);
    if (status) list = list.filter((r) => r.status === status);
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.fullName?.toLowerCase().includes(term) ||
          r.email?.toLowerCase().includes(term) ||
          r.referenceNumber?.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

// @desc    Update registration status (admin)
export const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (isDbConnected()) {
      const registration = await ProgramRegistration.findById(id);
      if (!registration) {
        return res.status(404).json({ success: false, message: 'Registration not found' });
      }
      registration.status = status;
      await registration.save();
      return res.json({ success: true, data: registration, message: `Status updated to ${status}` });
    }

    const reg = mockStore.programRegistrations.find((r) => r._id === id || r.id === id);
    if (!reg) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }

    reg.status = status;
    res.json({ success: true, data: reg, message: `Status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

// @desc    Check program access
export const checkProgramAccess = async (req, res, next) => {
  try {
    const { programSlug } = req.params;
    const userId = req.user.id || req.user._id;

    if (req.user.role === 'admin') {
      return res.json({ success: true, hasAccess: true, status: 'Admin' });
    }

    if (isDbConnected()) {
      const registration = await ProgramRegistration.findOne({
        userId,
        programSlug,
        status: { $in: ['Approved', 'Active'] },
      });
      return res.json({
        success: true,
        hasAccess: Boolean(registration),
        status: registration ? registration.status : 'Not Registered',
        registration,
      });
    }

    const registration = mockStore.programRegistrations.find(
      (r) =>
        (r.userId === userId || r.email.toLowerCase() === req.user.email?.toLowerCase()) &&
        r.programSlug === programSlug &&
        (r.status === 'Approved' || r.status === 'Active')
    );

    res.json({
      success: true,
      hasAccess: Boolean(registration),
      status: registration ? registration.status : 'Not Registered',
      registration,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete registration (admin)
export const deleteRegistration = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleted = await ProgramRegistration.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await ProgramRegistration.findOneAndDelete({ referenceNumber: id });
      }
      return res.json({ success: true, message: 'Registration deleted successfully' });
    }

    mockStore.programRegistrations = mockStore.programRegistrations.filter(
      (r) => r._id !== id && r.id !== id && r.referenceNumber !== id
    );
    res.json({ success: true, message: 'Registration deleted successfully' });
  } catch (error) {
    next(error);
  }
};
