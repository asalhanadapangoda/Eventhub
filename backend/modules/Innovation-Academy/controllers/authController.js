import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { mockStore } from '../config/mockStore.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';
import { connectDB } from '../config/db.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable is required.');
  }
  return jwt.sign(
    {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, organization } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      const user = await User.create({
        name,
        email: cleanEmail,
        password,
        phone: phone || '',
        organization: organization || '',
        role: 'participant',
      });

      // Unified auth bridge: sync new Academy account to main Event & Space users collection
      try {
        const mainCol = mongoose.connection.collection('users');
        const existsMain = await mainCol.findOne({ email: cleanEmail });
        if (!existsMain) {
          await mainCol.insertOne({
            name: user.name,
            email: cleanEmail,
            password: user.password,
            contactNumber: user.phone || '',
            avatar: user.avatar || '',
            role: 'user',
            branch: 'TRACE Main Branch (Colombo)',
            permissions: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      } catch {}

      const token = generateToken(user);
      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          organization: user.organization,
        },
        message: 'Account created successfully. Welcome to TRACE Sri Lanka!',
      });
    }

    // In-memory fallback
    const existing = mockStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const newUser = {
      _id: `mock_usr_${Date.now()}`,
      id: `mock_usr_${Date.now()}`,
      name,
      email: cleanEmail,
      password: bcrypt.hashSync(password, 10),
      role: 'participant',
      phone: phone || '',
      organization: organization || '',
      bio: '',
      avatar: '',
      createdAt: new Date(),
    };

    mockStore.users.push(newUser);
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        _id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        organization: newUser.organization,
      },
      message: 'Account created successfully. Welcome to TRACE Sri Lanka!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (isDbConnected()) {
      let user = await User.findOne({ email: cleanEmail });

      // Unified auth bridge: if user registered on Event & Space first, auto-provision in Innovation Academy
      if (!user) {
        const mainUser = await mongoose.connection.collection('users').findOne({ email: cleanEmail });
        if (mainUser && mainUser.password && (await bcrypt.compare(password, mainUser.password))) {
          const mappedRole = ['admin', 'super_admin', 'branch_admin'].includes(mainUser.role)
            ? 'admin'
            : 'participant';
          user = await User.create({
            name: mainUser.name || cleanEmail.split('@')[0],
            email: cleanEmail,
            password,
            phone: mainUser.contactNumber || '',
            organization: mainUser.branch || '',
            avatar: mainUser.avatar || '',
            role: mappedRole,
          });
        }
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      const token = generateToken(user);
      return res.json({
        success: true,
        token,
        user: {
          id: user._id,
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          organization: user.organization,
          bio: user.bio,
          avatar: user.avatar,
        },
        message: `Welcome back, ${user.name}!`,
      });
    }

    // In-memory fallback
    const user = mockStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        organization: user.organization,
        bio: user.bio,
        avatar: user.avatar,
      },
      message: `Welcome back, ${user.name}!`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (isDbConnected()) {
      const user = await User.findById(userId).select('-password');
      if (user) {
        return res.json({ success: true, user });
      }
    }

    // In-memory fallback
    const user = mockStore.users.find((u) => u._id === userId || u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    const { password, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { name, phone, organization, bio, avatar } = req.body;

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (user) {
        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (organization !== undefined) user.organization = organization;
        if (bio !== undefined) user.bio = bio;
        if (avatar !== undefined) user.avatar = avatar;

        const updated = await user.save();
        return res.json({
          success: true,
          message: 'Profile updated successfully',
          user: updated,
        });
      }
    }

    // In-memory fallback
    const user = mockStore.users.find((u) => u._id === userId || u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (organization !== undefined) user.organization = organization;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    const { password, ...safeUser } = user;
    res.json({ success: true, message: 'Profile updated successfully', user: safeUser });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password',
      });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    if (isDbConnected()) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password does not match' });
      }
      user.password = newPassword;
      await user.save();
      return res.json({ success: true, message: 'Password updated successfully' });
    }

    // In-memory fallback
    const user = mockStore.users.find((u) => u._id === userId || u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password does not match' });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Request 6-digit Reset Code
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user;

    if (isDbConnected()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = mockStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    // Generate secure 6-digit numeric OTP code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    if (isDbConnected()) {
      user.resetPasswordCode = resetCode;
      user.resetPasswordExpires = expiryTime;
      await user.save();
    } else {
      user.resetPasswordCode = resetCode;
      user.resetPasswordExpires = expiryTime;
    }

    // Send email via emailService
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      code: resetCode,
    });

    if (!emailResult.sent) {
      return res.status(500).json({
        success: false,
        message:
          emailResult.error ||
          'Failed to dispatch email. Please check your SMTP settings in server/.env.',
      });
    }

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${user.email}. Please check your inbox or spam folder.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify 6-digit Reset Code
export const verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and verification code.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();
    let user;

    if (isDbConnected()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = mockStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== cleanCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check the code and try again.',
      });
    }

    if (!user.resetPasswordExpires || new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    res.json({
      success: true,
      message: 'Verification code confirmed. You may now enter your new password.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with verified 6-digit code
export const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, verification code, and new password.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();
    let user;

    if (isDbConnected()) {
      user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'No account found with this email address.',
        });
      }

      if (!user.resetPasswordCode || user.resetPasswordCode !== cleanCode) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification code.',
        });
      }

      if (!user.resetPasswordExpires || new Date(user.resetPasswordExpires) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired. Please request a new code.',
        });
      }

      user.password = newPassword;
      user.resetPasswordCode = null;
      user.resetPasswordExpires = null;
      await user.save();

      return res.json({
        success: true,
        message: 'Password reset successful! You can now log in with your new password.',
      });
    }

    // In-memory fallback
    user = mockStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
      });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== cleanCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code.',
      });
    }

    if (!user.resetPasswordExpires || new Date(user.resetPasswordExpires) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    user.password = bcrypt.hashSync(newPassword, 10);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;

    res.json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};
