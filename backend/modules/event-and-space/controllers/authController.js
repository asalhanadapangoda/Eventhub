const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const { signToken, signRefreshToken, verifyToken } = require("../middleware/authMiddleware");
const crypto = require("crypto");
const logger = require("../../../common/logger");
const { parsePagination } = require("../../../common/pagination");

// Sync Event & Space user record to Innovation Academy users collection (unified single account)
const syncToAcademyUser = async (userDoc, plainPassword = null) => {
  try {
    if (mongoose.connection.readyState !== 1 || !userDoc?.email) return;
    const acadCol = mongoose.connection.collection("academy_users");
    const emailClean = userDoc.email.toLowerCase().trim();
    const mappedRole = ["admin", "super_admin", "branch_admin"].includes(userDoc.role) ? "admin" : "participant";
    const existing = await acadCol.findOne({ email: emailClean });
    if (!existing) {
      const hashedPassword = plainPassword ? await bcrypt.hash(plainPassword, 10) : userDoc.password;
      await acadCol.insertOne({
        name: userDoc.name,
        email: emailClean,
        password: hashedPassword,
        phone: userDoc.contactNumber || "",
        organization: "",
        bio: "",
        avatar: userDoc.avatar || "",
        role: mappedRole,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else if (plainPassword) {
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      await acadCol.updateOne({ email: emailClean }, { $set: { password: hashedPassword, updatedAt: new Date() } });
    }
  } catch (err) {
    logger.warn({ err: err.message }, "Cross-module user sync notice");
  }
};

// POST /api/auth/signup
const signupUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, contactNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please provide Name, Email, and Password." });
    }

    const emailClean = String(email).toLowerCase().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailClean)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address (e.g. name@domain.com)." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match. Please double-check your password." });
    }

    let cleanPhone = "";
    if (contactNumber && String(contactNumber).trim()) {
      cleanPhone = String(contactNumber).trim();
      const stripped = cleanPhone.replace(/[\s\-()]/g, "");
      if (!/^\+?[0-9]{9,15}$/.test(stripped)) {
        return res.status(400).json({ success: false, message: "Please enter a valid contact phone number (e.g. +94 77 123 4567 or 077 123 4567)." });
      }
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email: emailClean });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email address already exists. Please log in." });
    }

    // Enforce role: "user" for all public registrations to prevent privilege escalation
    const user = new User({
      name: String(name).trim(),
      email: emailClean,
      password,
      contactNumber: cleanPhone,
      role: "user",
    });

    await user.save();
    await syncToAcademyUser(user);

    const tokenPayload = { id: user._id, email: user.email, role: user.role, tokenVersion: user.tokenVersion || 0 };
    const token = signToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          avatar: user.avatar || "",
          role: user.role,
          mustChangePassword: Boolean(user.mustChangePassword),
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Signup failed", error: error.message });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide both Email and Password." });
    }

    const emailClean = email.toLowerCase().trim();
    let user = await User.findOne({ email: emailClean });

    // Unified auth bridge: if user registered on Innovation Academy first, auto-provision in Event & Space
    if (!user && mongoose.connection.readyState === 1) {
      const acadUser = await mongoose.connection.collection("academy_users").findOne({ email: emailClean });
      if (acadUser && acadUser.password && (await bcrypt.compare(password, acadUser.password))) {
        user = new User({
          name: acadUser.name || emailClean.split("@")[0],
          email: emailClean,
          password,
          contactNumber: acadUser.phone || "",
          avatar: acadUser.avatar || "",
          role: acadUser.role === "admin" ? "admin" : "user",
        });
        await user.save();
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    syncToAcademyUser(user).catch(() => {});

    const tokenPayload = { id: user._id, email: user.email, role: user.role, tokenVersion: user.tokenVersion || 0 };
    const token = signToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.json({
      success: true,
      message: user.mustChangePassword
        ? "Logged in. Please change your temporary password immediately."
        : "Logged in successfully!",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          avatar: user.avatar || "",
          role: user.role,
          mustChangePassword: Boolean(user.mustChangePassword),
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        contactNumber: req.user.contactNumber,
        avatar: req.user.avatar || "",
        role: req.user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile", error: error.message });
  }
};

// PUT /api/auth/profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.contactNumber !== undefined) user.contactNumber = req.body.contactNumber;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.email) {
      const emailClean = req.body.email.toLowerCase().trim();
      if (emailClean !== user.email) {
        const existing = await User.findOne({ email: emailClean });
        if (existing) {
          return res.status(400).json({ success: false, message: "Email is already in use by another account." });
        }
        user.email = emailClean;
      }
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully!",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        avatar: user.avatar || "",
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update profile", error: error.message });
  }
};

// PUT /api/auth/change-password (Change password for logged-in user)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide both Current Password and New Password." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters long." });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Incorrect current password. Please try again." });
    }

    // Set new password (the pre-save hook in User.js automatically hashes it with bcrypt)
    user.password = newPassword;
    user.mustChangePassword = false;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    await syncToAcademyUser(user, newPassword);

    logger.info({ email: user.email }, "[AUTH] Password changed successfully");

    const tokenPayload = { id: user._id, email: user.email, role: user.role, tokenVersion: user.tokenVersion };
    res.json({
      success: true,
      message: "Password changed successfully!",
      data: {
        token: signToken(tokenPayload),
        refreshToken: signRefreshToken(tokenPayload),
      },
    });
  } catch (error) {
    logger.error({ err: error.message }, "Change password error");
    res.status(500).json({ success: false, message: "Failed to change password", error: error.message });
  }
};

// POST /api/auth/refresh (Exchange valid refresh token for a new access token)
const refreshTokenUser = async (req, res) => {
  try {
    const incomingToken =
      req.body?.refreshToken ||
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!incomingToken) {
      return res.status(401).json({ success: false, message: "Refresh token is required" });
    }

    const decoded = verifyToken(incomingToken);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User account no longer exists" });
    }

    if (typeof decoded.tokenVersion === "number" && (user.tokenVersion || 0) !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: "Refresh token has been revoked" });
    }

    const tokenPayload = { id: user._id, email: user.email, role: user.role, tokenVersion: user.tokenVersion || 0 };
    return res.json({
      success: true,
      data: {
        token: signToken(tokenPayload),
        refreshToken: signRefreshToken(tokenPayload),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to refresh token", error: error.message });
  }
};

// POST /api/auth/logout (Revoke all active JWTs for the current user by incrementing tokenVersion)
const logoutUser = async (req, res) => {
  try {
    if (req.user?._id) {
      await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });
    }
    return res.json({ success: true, message: "Logged out and active tokens revoked" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout failed", error: error.message });
  }
};

// Seed default Admin User if none exists (reads password from ADMIN_SEED_PASSWORD env var and forces password change on first login)
const seedAdminUser = async () => {
  try {
    const seedEmail = (process.env.ADMIN_SEED_EMAIL || "admin@trace.lk").toLowerCase().trim();
    const adminExists = await User.findOne({ $or: [{ email: seedEmail }, { role: "admin" }] });
    if (!adminExists) {
      const seedPassword = process.env.ADMIN_SEED_PASSWORD;
      if (!seedPassword || seedPassword.length < 8) {
        logger.info("No admin user found in DB. Set ADMIN_SEED_PASSWORD (min 8 chars) in .env to seed an initial admin.");
        return;
      }
      const admin = new User({
        name: "TRACE Admin",
        email: seedEmail,
        password: seedPassword,
        contactNumber: "+94 11 234 5678",
        role: "admin",
        mustChangePassword: true,
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
      });
      await admin.save();
      await syncToAcademyUser(admin, seedPassword);
      logger.info({ email: seedEmail }, "Initial Admin user seeded with mustChangePassword=true");
    }
  } catch (err) {
    logger.error({ err: err.message }, "Error seeding admin user");
  }
};

// GET /api/auth/users (Get registered users for Admin with pagination)
const getAllUsers = async (req, res) => {
  res.setHeader("Cache-Control", "private, max-age=15");
  const { page, limit, skip } = parsePagination(req.query);

  try {
    const [users, total] = await Promise.all([
      User.find()
        .select("-password -resetPasswordOtp -resetPasswordOtpExpires")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(),
    ]);
    res.json({
      success: true,
      count: users.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch registered users", error: error.message });
  }
};

// DELETE /api/auth/users/:id (Delete a user account)
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json({ success: true, message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user", error: error.message });
  }
};

// PUT /api/auth/users/:id (Update admin account details)
const updateUserAdminDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    if (req.body.name) user.name = req.body.name;
    if (req.body.branch) user.branch = req.body.branch;
    if (req.body.permissions) user.permissions = req.body.permissions;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.contactNumber !== undefined) user.contactNumber = req.body.contactNumber;

    await user.save();

    res.json({
      success: true,
      message: `Admin details for ${user.name} updated successfully!`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        permissions: user.permissions,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update admin details", error: error.message });
  }
};

const nodemailer = require("nodemailer");

// Nodemailer Email Transport Helper
const sendRealEmail = async ({ to, subject, html }) => {
  try {
    let transporter;
    const cleanUser = (process.env.EMAIL_USER || "").trim();
    const cleanPass = (process.env.EMAIL_PASS || "").replace(/\s+/g, "").trim();

    const isRealConfigured =
      cleanUser &&
      cleanPass &&
      !cleanUser.includes("your_gmail_address");

    if (isRealConfigured) {
      logger.info({ to }, `Sending REAL email via Gmail SMTP (${cleanUser})`);
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: parseInt(process.env.EMAIL_PORT || "587", 10),
        secure: false, // 587 uses STARTTLS
        auth: {
          user: cleanUser,
          pass: cleanPass,
        },
      });
    } else {
      logger.info({ to }, "Sending test email via Ethereal SMTP fallback");
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const info = await transporter.sendMail({
      from: `"TRACE Event Hub Admin" <${process.env.EMAIL_USER || "admin@trace.lk"}>`,
      to,
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    logger.error({ err: err.message }, "Nodemailer dispatch error");
    return { success: false, error: err.message };
  }
};

// POST /api/auth/create-branch-admin (Assign new Branch Admin and send email notification)
const createBranchAdmin = async (req, res) => {
  try {
    const { name, email, password, branch, permissions } = req.body;

    if (!name || !email || !password || !branch) {
      return res.status(400).json({ success: false, message: "Please provide Name, Email, Password, and Branch." });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const emailClean = email.toLowerCase().trim();

    // Check if user already exists
    let user = await User.findOne({ email: emailClean });
    if (user) {
      user.role = "branch_admin";
      user.branch = branch;
      user.permissions = permissions || ["manage_events", "manage_registrations"];
      if (password) user.password = password;
      await user.save();
    } else {
      user = new User({
        name,
        email: emailClean,
        password,
        role: "branch_admin",
        branch,
        permissions: permissions || ["manage_events", "manage_registrations"],
      });
      await user.save();
    }

    const emailSubject = `🔐 Welcome to TRACE Event Hub - Your ${branch} Admin Credentials`;
    const permissionsListHtml = (permissions || ["manage_events", "manage_registrations"])
      .map((p) => `<li style="color:#059669;font-weight:600;margin-bottom:4px;">✓ ${p.replace("_", " ").toUpperCase()}</li>`)
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px; color: #334155;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div style="background: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">🔐 TRACE Event Hub</h2>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Branch Admin Access Credentials</p>
          </div>
          <div style="padding: 24px;">
            <p>Hello <strong>${name}</strong>,</p>
            <p>You have been officially granted <strong>Branch Admin Access</strong> for <strong>${branch}</strong> on the TRACE Event Hub enterprise platform.</p>

            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <div style="margin-bottom: 8px;">📧 <strong>Login Email:</strong> <span style="color:#0052cc;font-weight:600;">${emailClean}</span></div>
              <div style="margin-bottom: 8px;">🔑 <strong>Temporary Password:</strong> <code style="background:#e2e8f0;padding:3px 6px;border-radius:4px;color:#0f172a;">${password}</code></div>
              <div>🏢 <strong>Assigned Branch:</strong> <strong>${branch}</strong></div>
            </div>

            <div style="margin-bottom: 16px;">
              <strong>Granted Scope & Permissions:</strong>
              <ul style="margin: 8px 0 0 18px; padding: 0;">
                ${permissionsListHtml}
              </ul>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Trigger real email dispatch via Nodemailer
    const emailResult = await sendRealEmail({
      to: emailClean,
      subject: emailSubject,
      html: emailHtml,
    });

    const emailContent = {
      recipient: emailClean,
      subject: emailSubject,
      adminName: name,
      branchName: branch,
      email: emailClean,
      grantedPermissions: permissions || ["manage_events", "manage_registrations"],
      sentAt: new Date().toISOString(),
      previewUrl: emailResult.previewUrl || null,
    };

    res.status(201).json({
      success: true,
      message: `Branch Admin assigned for ${branch}! Email sent to ${emailClean}.`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        permissions: user.permissions,
      },
      emailNotification: emailContent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create branch admin", error: error.message });
  }
};

// POST /api/auth/send-credentials-email (Send email credentials to existing user/admin on demand)
const sendEmailCredentials = async (req, res) => {
  try {
    const { userId, email, password } = req.body;
    const user = await User.findOne({ $or: [{ _id: userId }, { email: email?.toLowerCase().trim() }] });

    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    const tempPass = password || "BranchAdmin@2026";
    const emailSubject = `🔐 TRACE Event Hub - Your Credentials for ${user.branch || "TRACE Main"}`;
    const perms = user.permissions && user.permissions.length > 0 ? user.permissions : ["manage_events", "manage_registrations"];

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 20px; color: #334155;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <div style="background: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 20px;">🔐 TRACE Event Hub</h2>
            <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 13px;">Admin Credentials Notification</p>
          </div>
          <div style="padding: 24px;">
            <p>Hello <strong>${user.name}</strong>,</p>
            <p>Here are your access details for <strong>${user.branch || "TRACE Main"}</strong> on TRACE Event Hub:</p>
            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <div style="margin-bottom: 8px;">📧 <strong>Login Email:</strong> <span style="color:#0052cc;font-weight:600;">${user.email}</span></div>
              <div style="margin-bottom: 8px;">🔑 <strong>Password:</strong> <code style="background:#e2e8f0;padding:3px 6px;border-radius:4px;color:#0f172a;">${tempPass}</code></div>
              <div>🏢 <strong>Branch:</strong> <strong>${user.branch || "TRACE Main"}</strong></div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResult = await sendRealEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
    });

    res.json({
      success: true,
      message: `Credentials email dispatched to ${user.email}!`,
      previewUrl: emailResult.previewUrl || null,
      emailNotification: {
        recipient: user.email,
        subject: emailSubject,
        adminName: user.name,
        branchName: user.branch || "TRACE Main",
        email: user.email,
        grantedPermissions: perms,
        sentAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to dispatch email", error: error.message });
  }
};

// POST /api/auth/forgot-password (Request 6-digit verification code to reset password)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide your email address." });
    }

    const emailClean = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailClean });
    if (!user) {
      return res.status(404).json({ success: false, message: "No registered account found with this email address." });
    }

    // Generate secure 6-digit numeric OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP with sha256 before saving to database
    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    // Code expires in 15 minutes
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpires = expires;
    await user.save();

    logger.info({ email: user.email }, "[AUTH] Password reset code generated");

    const emailSubject = `🔐 TRACE Event Hub - Password Reset Code: ${otp}`;
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; background-color: #f1f5f9; padding: 24px; color: #334155; margin: 0;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #cbd5e1; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: #ffffff; padding: 28px 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px;">🔐 TRACE Event Hub</h2>
            <p style="margin: 6px 0 0 0; color: #c7d2fe; font-size: 13px;">Security & Password Recovery</p>
          </div>
          <div style="padding: 28px 24px;">
            <p style="font-size: 15px; margin-top: 0;">Hello <strong>${user.name}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
              We received a request to reset the password for your TRACE Event Hub account (<strong>${user.email}</strong>).
            </p>
            <p style="font-size: 14px; color: #475569; line-height: 1.5;">
              Please use the 6-digit verification code below to set your new password:
            </p>

            <div style="background: #f8fafc; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Your 6-Digit Reset Code</div>
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #4338ca; font-family: monospace;">${otp}</div>
              <div style="font-size: 12px; color: #e11d48; margin-top: 10px; font-weight: 600;">⏰ Valid for 15 minutes only</div>
            </div>

            <p style="font-size: 13px; color: #64748b; margin-bottom: 0; line-height: 1.5;">
              If you didn't request a password reset, you can safely ignore this email. Your current password remains active and secure.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
            TRACE Expert City, Colombo &bull; Enterprise Event Hub &bull; Need help? Contact <a href="mailto:admin@trace.lk" style="color:#6366f1;text-decoration:none;">admin@trace.lk</a>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailResult = await sendRealEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
    });

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${user.email}.`,
      previewUrl: emailResult.previewUrl || null,
    });
  } catch (error) {
    logger.error({ err: error.message }, "Forgot password error");
    res.status(500).json({ success: false, message: "Failed to send password reset code.", error: error.message });
  }
};

// POST /api/auth/verify-reset-otp (Validate 6-digit verification code)
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Please provide email and the 6-digit code." });
    }

    const emailClean = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailClean });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: "No active password reset request found. Please request a new code." });
    }

    if (new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: "Verification code has expired. Please request a new one." });
    }

    const hashedInputOtp = crypto.createHash("sha256").update(otp.trim()).digest("hex");
    if (user.resetPasswordOtp !== hashedInputOtp) {
      return res.status(400).json({ success: false, message: "Invalid verification code. Please check and try again." });
    }

    res.json({ success: true, message: "Verification code validated successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed.", error: error.message });
  }
};

// POST /api/auth/reset-password (Set new password using verified 6-digit code)
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Please provide email, verification code, and new password." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const emailClean = email.toLowerCase().trim();
    const user = await User.findOne({ email: emailClean });
    if (!user) {
      return res.status(404).json({ success: false, message: "User account not found." });
    }

    if (!user.resetPasswordOtp || !user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: "No active password reset request found. Please request a new code." });
    }

    if (new Date() > user.resetPasswordOtpExpires) {
      return res.status(400).json({ success: false, message: "Verification code has expired. Please request a new code." });
    }

    const hashedInputOtp = crypto.createHash("sha256").update(otp.trim()).digest("hex");
    if (user.resetPasswordOtp !== hashedInputOtp) {
      return res.status(400).json({ success: false, message: "Invalid verification code. Please check and try again." });
    }

    // Set new password (the pre-save hook will automatically hash with bcrypt)
    user.password = newPassword;
    user.mustChangePassword = false;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();
    await syncToAcademyUser(user, newPassword);

    logger.info({ email: user.email }, "[AUTH] Password successfully reset for user");

    res.json({
      success: true,
      message: "Your password has been successfully reset! You can now log in with your new password.",
    });
  } catch (error) {
    logger.error({ err: error.message }, "Reset password error");
    res.status(500).json({ success: false, message: "Failed to reset password.", error: error.message });
  }
};

module.exports = {
  signupUser,
  loginUser,
  refreshTokenUser,
  logoutUser,
  getMe,
  updateUserProfile,
  seedAdminUser,
  getAllUsers,
  deleteUser,
  updateUserAdminDetails,
  createBranchAdmin,
  sendEmailCredentials,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
};

