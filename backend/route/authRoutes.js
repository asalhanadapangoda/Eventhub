const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const {
  signupUser,
  loginUser,
  getMe,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  updateUserAdminDetails,
  createBranchAdmin,
  sendEmailCredentials,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
} = require("../controlers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Rate limiting for auth endpoints (prevents brute-force attacks)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  message: { success: false, message: "Too many login attempts from this IP, please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/signup
router.post("/signup", authLimiter, signupUser);

// POST /api/auth/login
router.post("/login", authLimiter, loginUser);

// POST /api/auth/forgot-password (Request reset code)
router.post("/forgot-password", authLimiter, forgotPassword);

// POST /api/auth/verify-reset-otp (Validate reset code)
router.post("/verify-reset-otp", authLimiter, verifyResetOtp);

// POST /api/auth/reset-password (Set new password)
router.post("/reset-password", authLimiter, resetPassword);

// POST /api/auth/create-branch-admin (Admin only)
router.post("/create-branch-admin", protect, authorize("admin", "super_admin"), createBranchAdmin);

// POST /api/auth/send-credentials-email (Admin only)
router.post("/send-credentials-email", protect, authorize("admin", "super_admin"), sendEmailCredentials);

// GET /api/auth/me
router.get("/me", protect, getMe);

// PUT /api/auth/profile
router.put("/profile", protect, updateUserProfile);

// PUT /api/auth/change-password (Logged-in user password change)
router.put("/change-password", protect, changePassword);

// GET /api/auth/users (All registered users - Admin only)
router.get("/users", protect, authorize("admin", "super_admin", "branch_admin"), getAllUsers);

// PUT /api/auth/users/:id (Update admin user details - Admin only)
router.put("/users/:id", protect, authorize("admin", "super_admin", "branch_admin"), updateUserAdminDetails);

// DELETE /api/auth/users/:id (Admin only)
router.delete("/users/:id", protect, authorize("admin", "super_admin"), deleteUser);

module.exports = router;
