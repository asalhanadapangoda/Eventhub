import mongoose from 'mongoose';
import Program from '../models/Program.js';
import Workshop from '../models/Workshop.js';
import ProgramRegistration from '../models/ProgramRegistration.js';
import { mockStore } from '../config/mockStore.js';
import { connectDB } from '../config/db.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all programs
export const getPrograms = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (isDbConnected()) {
      const [programs, workshopCounts, registrationCounts] = await Promise.all([
        Program.find().sort({ createdAt: 1 }).lean(),
        Workshop.aggregate([{ $group: { _id: '$programId', count: { $sum: 1 } } }]),
        ProgramRegistration.aggregate([{ $group: { _id: '$programId', count: { $sum: 1 } } }]),
      ]);

      const wMap = new Map(workshopCounts.map((w) => [String(w._id), w.count]));
      const rMap = new Map(registrationCounts.map((r) => [String(r._id), r.count]));

      const enriched = programs.map((prog) => ({
        ...prog,
        workshopCount: wMap.get(String(prog._id)) || 0,
        registrationCount: rMap.get(String(prog._id)) || 0,
      }));

      // High-performance Vercel Edge caching
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
      return res.json({ success: true, count: enriched.length, data: enriched });
    }

    // In-memory fallback
    const enriched = mockStore.programs.map((prog) => {
      const workshopCount = mockStore.workshops.filter(
        (w) => w.programSlug === prog.slug || w.programId === prog._id || w.programId === prog.id
      ).length;
      const registrationCount = mockStore.programRegistrations.filter(
        (r) => r.programSlug === prog.slug || r.programId === prog._id || r.programId === prog.id
      ).length;
      return {
        ...prog,
        workshopCount,
        registrationCount,
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single program by slug (or ID)
export const getProgramBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (isDbConnected()) {
      let program = await Program.findOne({ slug });
      if (!program && slug.match(/^[0-9a-fA-F]{24}$/)) {
        program = await Program.findById(slug);
      }

      if (!program) {
        return res.status(404).json({
          success: false,
          message: `Program with identifier '${slug}' not found`,
        });
      }

      const workshops = await Workshop.find({
        $or: [{ programId: program._id }, { programSlug: program.slug }],
      }).sort({ date: 1 });

      const registrationCount = await ProgramRegistration.countDocuments({
        programId: program._id,
      });

      return res.json({
        success: true,
        data: {
          ...program.toObject(),
          workshops,
          registrationCount,
        },
      });
    }

    // In-memory fallback
    const program = mockStore.programs.find((p) => p.slug === slug || p.id === slug || p._id === slug);
    if (!program) {
      return res.status(404).json({
        success: false,
        message: `Program with identifier '${slug}' not found`,
      });
    }

    const workshops = mockStore.workshops.filter(
      (w) => w.programSlug === program.slug || w.programId === program._id || w.programId === program.id
    );
    const registrationCount = mockStore.programRegistrations.filter(
      (r) => r.programSlug === program.slug || r.programId === program._id || r.programId === program.id
    ).length;

    res.json({
      success: true,
      data: {
        ...program,
        workshops,
        registrationCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper to normalize program payload
const prepareProgramData = (body) => {
  const data = { ...body };
  delete data._id;
  delete data.id;

  if (data.title && !data.slug) {
    data.slug = data.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  if (!data.programId) {
    data.programId = data.slug || `prog-${Date.now()}`;
  }

  if (!data.shortDescription && data.description) {
    data.shortDescription = data.description.slice(0, 140) + '...';
  }

  const arrayFields = [
    'objectives',
    'targetAudience',
    'benefits',
    'activities',
    'learningOutcomes',
    'highlights',
  ];
  arrayFields.forEach((field) => {
    if (typeof data[field] === 'string') {
      data[field] = data[field]
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  });

  if (data.coordinatorName || data.coordinatorEmail) {
    data.coordinator = {
      name: data.coordinatorName || data.coordinator?.name || 'Dilshan Perera',
      email: data.coordinatorEmail || data.coordinator?.email || 'projects@trace.lk',
      title: data.coordinatorTitle || data.coordinator?.title || 'Head of Programs & Incubation',
      phone: data.coordinatorPhone || data.coordinator?.phone || '+94 70 181 0494',
    };
  }

  return data;
};

// @desc    Create new program (admin)
export const createProgram = async (req, res, next) => {
  try {
    const programData = prepareProgramData(req.body);

    if (isDbConnected()) {
      const program = await Program.create(programData);
      return res.status(201).json({ success: true, data: program, message: 'Program created successfully' });
    }

    const newProgram = {
      _id: `mock_prog_${Date.now()}`,
      id: `mock_prog_${Date.now()}`,
      ...programData,
      createdAt: new Date(),
    };
    mockStore.programs.push(newProgram);
    res.status(201).json({ success: true, data: newProgram, message: 'Program created successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update program (admin)
export const updateProgram = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.slug;
    const updateData = prepareProgramData(req.body);

    if (isDbConnected()) {
      let program = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        program = await Program.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });
      }
      if (!program) {
        program = await Program.findOneAndUpdate(
          { $or: [{ slug: id }, { programId: id }] },
          updateData,
          { new: true, runValidators: true }
        );
      }
      if (!program) {
        return res.status(404).json({ success: false, message: 'Program not found' });
      }
      return res.json({ success: true, data: program, message: 'Program updated successfully' });
    }

    // In-memory fallback
    const idx = mockStore.programs.findIndex((p) => p._id === id || p.id === id || p.slug === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }

    mockStore.programs[idx] = {
      ...mockStore.programs[idx],
      ...updateData,
    };

    res.json({ success: true, data: mockStore.programs[idx], message: 'Program updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete program (admin)
export const deleteProgram = async (req, res, next) => {
  try {
    const id = req.params.id || req.params.slug;

    if (isDbConnected()) {
      let program = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        program = await Program.findById(id);
      }
      if (!program) {
        program = await Program.findOne({ $or: [{ slug: id }, { programId: id }] });
      }
      if (!program) {
        return res.status(404).json({ success: false, message: 'Program not found' });
      }
      await Workshop.deleteMany({
        $or: [{ programId: program._id }, { programSlug: program.slug }],
      });
      await ProgramRegistration.deleteMany({
        $or: [{ programId: program._id }, { programSlug: program.slug }],
      });
      await program.deleteOne();
      return res.json({ success: true, message: 'Program deleted successfully' });
    }

    mockStore.programs = mockStore.programs.filter((p) => p._id !== id && p.id !== id && p.slug !== id);
    res.json({ success: true, message: 'Program deleted successfully' });
  } catch (error) {
    next(error);
  }
};
