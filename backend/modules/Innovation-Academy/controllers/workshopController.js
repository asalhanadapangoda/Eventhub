import mongoose from 'mongoose';
import Workshop from '../models/Workshop.js';
import Program from '../models/Program.js';
import ProgramRegistration from '../models/ProgramRegistration.js';
import { mockStore } from '../config/mockStore.js';
import { connectDB } from '../config/db.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all workshops
export const getWorkshops = async (req, res, next) => {
  try {
    const { programSlug, programId, status } = req.query;

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (isDbConnected()) {
      const filter = {};
      if (programSlug) filter.programSlug = programSlug;
      if (programId) filter.programId = programId;
      if (status) filter.status = status;

      const workshops = await Workshop.find(filter)
        .populate('programId', 'title slug badge')
        .sort({ createdAt: -1 })
        .lean();

      // High-performance Vercel Edge caching
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.json({ success: true, count: workshops.length, data: workshops });
    }

    // In-memory fallback
    let list = [...mockStore.workshops];
    if (programSlug) list = list.filter((w) => w.programSlug === programSlug);
    if (programId) list = list.filter((w) => w.programId === programId);
    if (status) list = list.filter((w) => w.status === status);

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single workshop by slug with access verification
export const getWorkshopBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (isDbConnected()) {
      let workshop = await Workshop.findOne({ slug }).populate('programId');
      if (!workshop && slug.match(/^[0-9a-fA-F]{24}$/)) {
        workshop = await Workshop.findById(slug).populate('programId');
      }

      if (!workshop) {
        return res.status(404).json({ success: false, message: 'Workshop not found' });
      }

      let hasAccess = false;
      let registrationStatus = null;

      if (req.user) {
        if (req.user.role === 'admin') {
          hasAccess = true;
          registrationStatus = 'Admin Access';
        } else {
          const registration = await ProgramRegistration.findOne({
            userId: req.user.id || req.user._id,
            $or: [
              { programId: workshop.programId?._id || workshop.programId },
              { programSlug: workshop.programSlug },
            ],
            status: { $in: ['Approved', 'Active'] },
          });

          if (registration) {
            hasAccess = true;
            registrationStatus = registration.status;
          }
        }
      }

      const workshopData = workshop.toObject();
      if (!hasAccess) {
        workshopData.meetingLink = null;
        workshopData.isLocked = true;
      } else {
        workshopData.isLocked = false;
      }

      return res.json({
        success: true,
        data: workshopData,
        access: {
          hasAccess,
          status: registrationStatus,
          parentProgramSlug: workshop.programSlug,
          parentProgramTitle: workshop.programTitle || workshop.programId?.title,
        },
      });
    }

    // In-memory fallback
    const workshop = mockStore.workshops.find((w) => w.slug === slug || w._id === slug || w.id === slug);
    if (!workshop) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    let hasAccess = false;
    let registrationStatus = null;

    if (req.user) {
      if (req.user.role === 'admin') {
        hasAccess = true;
        registrationStatus = 'Admin Access';
      } else {
        const userId = req.user.id || req.user._id;
        const registration = mockStore.programRegistrations.find(
          (r) =>
            (r.userId === userId || r.email === req.user.email) &&
            r.programSlug === workshop.programSlug &&
            (r.status === 'Approved' || r.status === 'Active')
        );

        if (registration) {
          hasAccess = true;
          registrationStatus = registration.status;
        }
      }
    }

    const workshopData = { ...workshop };
    if (!hasAccess) {
      workshopData.meetingLink = null;
      workshopData.isLocked = true;
    } else {
      workshopData.isLocked = false;
    }

    res.json({
      success: true,
      data: workshopData,
      access: {
        hasAccess,
        status: registrationStatus,
        parentProgramSlug: workshop.programSlug,
        parentProgramTitle: workshop.programTitle,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create workshop (admin)
export const createWorkshop = async (req, res, next) => {
  try {
    const {
      title,
      description,
      programId,
      date,
      startTime,
      endTime,
      venue,
      isOnline,
      meetingLink,
      speakerName,
      speakerDescription,
      speakerAvatar,
      topicsCovered,
      learningOutcomes,
      additionalInstructions,
      status,
      capacity,
      coverImage,
    } = req.body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (isDbConnected()) {
      const parentProgram = await Program.findById(programId);
      if (!parentProgram) {
        return res.status(400).json({
          success: false,
          message: 'Valid parent program ID is required. Workshop must belong to a program.',
        });
      }

      const workshop = await Workshop.create({
        title,
        slug,
        description,
        coverImage: coverImage || '',
        programId: parentProgram._id,
        programSlug: parentProgram.slug,
        programTitle: parentProgram.title,
        date,
        startTime,
        endTime,
        venue: venue || 'TRACE Expert City, Bay 05, Maradana',
        isOnline: Boolean(isOnline),
        meetingLink: meetingLink || '',
        speakerName,
        speakerDescription: speakerDescription || '',
        speakerAvatar: speakerAvatar || '',
        topicsCovered: Array.isArray(topicsCovered)
          ? topicsCovered
          : typeof topicsCovered === 'string'
          ? topicsCovered.split(',').map((t) => t.trim())
          : [],
        learningOutcomes: Array.isArray(learningOutcomes)
          ? learningOutcomes
          : typeof learningOutcomes === 'string'
          ? learningOutcomes.split(',').map((t) => t.trim())
          : [],
        additionalInstructions: additionalInstructions || '',
        status: status || 'Upcoming',
        capacity: capacity || 50,
      });

      return res.status(201).json({
        success: true,
        data: workshop,
        message: 'Workshop created successfully under ' + parentProgram.title,
      });
    }

    // In-memory fallback
    const parentProgram = mockStore.programs.find(
      (p) => p._id === programId || p.id === programId || p.slug === programId
    ) || mockStore.programs[0];

    const newWorkshop = {
      _id: `mock_wk_${Date.now()}`,
      id: `mock_wk_${Date.now()}`,
      title,
      slug,
      description,
      coverImage: coverImage || '',
      programId: parentProgram._id || parentProgram.id,
      programSlug: parentProgram.slug,
      programTitle: parentProgram.title,
      date,
      startTime,
      endTime,
      venue: venue || 'TRACE Expert City, Bay 05, Maradana',
      isOnline: Boolean(isOnline),
      meetingLink: meetingLink || '',
      speakerName,
      speakerDescription: speakerDescription || '',
      speakerAvatar: speakerAvatar || '',
      topicsCovered: Array.isArray(topicsCovered)
        ? topicsCovered
        : typeof topicsCovered === 'string'
        ? topicsCovered.split(',').map((t) => t.trim())
        : [],
      learningOutcomes: Array.isArray(learningOutcomes)
        ? learningOutcomes
        : typeof learningOutcomes === 'string'
        ? learningOutcomes.split(',').map((t) => t.trim())
        : [],
      additionalInstructions: additionalInstructions || '',
      status: status || 'Upcoming',
      capacity: capacity || 50,
      createdAt: new Date(),
    };

    mockStore.workshops.push(newWorkshop);
    res.status(201).json({
      success: true,
      data: newWorkshop,
      message: 'Workshop created successfully under ' + parentProgram.title,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update workshop (admin)
export const updateWorkshop = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.slug;
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.id;

    if (isDbConnected()) {
      let updated = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        updated = await Workshop.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });
      }
      if (!updated) {
        updated = await Workshop.findOneAndUpdate({ slug: id }, updateData, {
          new: true,
          runValidators: true,
        });
      }
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Workshop not found' });
      }
      return res.json({ success: true, data: updated, message: 'Workshop updated successfully' });
    }

    // In-memory fallback
    const idx = mockStore.workshops.findIndex((w) => w._id === id || w.id === id || w.slug === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Workshop not found' });
    }

    mockStore.workshops[idx] = {
      ...mockStore.workshops[idx],
      ...req.body,
    };

    res.json({ success: true, data: mockStore.workshops[idx], message: 'Workshop updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete workshop (admin)
export const deleteWorkshop = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.slug;

    if (isDbConnected()) {
      let deleted = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        deleted = await Workshop.findByIdAndDelete(id);
      }
      if (!deleted) {
        deleted = await Workshop.findOneAndDelete({ slug: id });
      }
      return res.json({ success: true, message: 'Workshop deleted successfully' });
    }

    mockStore.workshops = mockStore.workshops.filter((w) => w._id !== id && w.id !== id && w.slug !== id);
    res.json({ success: true, message: 'Workshop deleted successfully' });
  } catch (error) {
    next(error);
  }
};
