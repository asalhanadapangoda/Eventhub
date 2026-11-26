import mongoose from 'mongoose';
import VisitRequest from '../models/VisitRequest.js';
import Notification from '../models/Notification.js';
import { sendVisitRequestEmail } from '../utils/emailService.js';
import { mockStore } from '../config/mockStore.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

const generateVisitRef = () => {
  const random = Math.floor(100 + Math.random() * 900);
  return `VIS-TRC-${random}`;
};

// @desc    Submit new industry visit request
export const createVisitRequest = async (req, res, next) => {
  try {
    const {
      organizationName,
      organizationType,
      contactPerson,
      email,
      phone,
      numberOfParticipants,
      participantAgeGroup,
      preferredVisitDate,
      preferredTime,
      visitPurpose,
      areasOfInterest,
      additionalRequirements,
    } = req.body;

    if (
      !organizationName ||
      !organizationType ||
      !contactPerson ||
      !email ||
      !phone ||
      !numberOfParticipants ||
      !preferredVisitDate ||
      !preferredTime ||
      !visitPurpose
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required visit application fields.',
      });
    }

    const referenceNumber = generateVisitRef();
    const userId = req.user ? req.user.id || req.user._id : null;

    if (isDbConnected()) {
      const visitRequest = await VisitRequest.create({
        referenceNumber,
        userId,
        organizationName,
        organizationType,
        contactPerson,
        email: email.toLowerCase(),
        phone,
        numberOfParticipants: Number(numberOfParticipants),
        participantAgeGroup: participantAgeGroup || 'Undergraduates (19-24)',
        preferredVisitDate,
        preferredTime,
        visitPurpose,
        areasOfInterest: Array.isArray(areasOfInterest) ? areasOfInterest : [areasOfInterest],
        additionalRequirements: additionalRequirements || '',
        status: 'Pending',
      });

      sendVisitRequestEmail(visitRequest).catch(() => {});

      return res.status(201).json({
        success: true,
        message: `Your industry visit request has been successfully submitted! Reference Number: ${referenceNumber}`,
        data: visitRequest,
        referenceNumber,
      });
    }

    // In-memory fallback
    const newVisit = {
      _id: `mock_vis_${Date.now()}`,
      id: `mock_vis_${Date.now()}`,
      referenceNumber,
      userId,
      organizationName,
      organizationType,
      contactPerson,
      email: email.toLowerCase(),
      phone,
      numberOfParticipants: Number(numberOfParticipants),
      participantAgeGroup: participantAgeGroup || 'Undergraduates (19-24)',
      preferredVisitDate,
      preferredTime,
      visitPurpose,
      areasOfInterest: Array.isArray(areasOfInterest) ? areasOfInterest : [areasOfInterest],
      additionalRequirements: additionalRequirements || '',
      status: 'Pending',
      allocatedHost: 'TRACE Expert City Secretariat',
      createdAt: new Date(),
    };

    mockStore.visitRequests.unshift(newVisit);

    sendVisitRequestEmail(newVisit).catch(() => {});

    res.status(201).json({
      success: true,
      message: `Your industry visit request has been successfully submitted! Reference Number: ${referenceNumber}`,
      data: newVisit,
      referenceNumber,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's visit requests
export const getMyVisitRequests = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    if (isDbConnected()) {
      const requests = await VisitRequest.find({
        $or: [{ userId }, { email: req.user.email?.toLowerCase() }],
      }).sort({ createdAt: -1 });
      return res.json({ success: true, count: requests.length, data: requests });
    }

    const list = mockStore.visitRequests.filter(
      (v) => v.userId === userId || v.email.toLowerCase() === req.user.email?.toLowerCase()
    );

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all visit requests (admin)
export const getAllVisitRequests = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    if (isDbConnected()) {
      const query = {};
      if (status) query.status = status;
      if (search) {
        query.$or = [
          { organizationName: { $regex: search, $options: 'i' } },
          { contactPerson: { $regex: search, $options: 'i' } },
          { referenceNumber: { $regex: search, $options: 'i' } },
        ];
      }
      const requests = await VisitRequest.find(query).sort({ createdAt: -1 });
      return res.json({ success: true, count: requests.length, data: requests });
    }

    let list = [...mockStore.visitRequests];
    if (status) list = list.filter((r) => r.status === status);
    if (search) {
      const term = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.organizationName?.toLowerCase().includes(term) ||
          r.contactPerson?.toLowerCase().includes(term) ||
          r.referenceNumber?.toLowerCase().includes(term)
      );
    }

    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

// @desc    Update visit request status (admin)
export const updateVisitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, allocatedHost, preferredVisitDate, preferredTime } = req.body;

    if (isDbConnected()) {
      const visitRequest = await VisitRequest.findById(id);
      if (!visitRequest) {
        return res.status(404).json({ success: false, message: 'Visit request not found' });
      }
      if (status) visitRequest.status = status;
      if (adminNotes !== undefined) visitRequest.adminNotes = adminNotes;
      if (allocatedHost !== undefined) visitRequest.allocatedHost = allocatedHost;
      if (preferredVisitDate) visitRequest.preferredVisitDate = preferredVisitDate;
      if (preferredTime) visitRequest.preferredTime = preferredTime;
      await visitRequest.save();

      return res.json({ success: true, data: visitRequest, message: `Status updated to ${status}` });
    }

    const visit = mockStore.visitRequests.find((v) => v._id === id || v.id === id);
    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit request not found' });
    }

    if (status) visit.status = status;
    if (adminNotes !== undefined) visit.adminNotes = adminNotes;
    if (allocatedHost !== undefined) visit.allocatedHost = allocatedHost;
    if (preferredVisitDate) visit.preferredVisitDate = preferredVisitDate;
    if (preferredTime) visit.preferredTime = preferredTime;

    res.json({ success: true, data: visit, message: `Status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};
