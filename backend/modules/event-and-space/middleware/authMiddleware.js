const jwt = require("jsonwebtoken");
const User = require("../model/User");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("FATAL: JWT_SECRET environment variable is required.");
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "14d";

// Sign short-lived access JWT Token
const signToken = (payload) => {
  return jwt.sign({ ...payload, tokenType: "access" }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Sign refresh JWT Token
const signRefreshToken = (payload) => {
  return jwt.sign({ ...payload, tokenType: "refresh" }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length > 1 && parts[1] && parts[1] !== "null" && parts[1] !== "undefined") {
      token = parts[1];
    }
  }

  const decoded = token ? verifyToken(token) : null;

  if (decoded && decoded.id && decoded.tokenType !== "refresh") {
    req.user = {
      _id: decoded.id,
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || "user",
    };

    try {
      const user = await User.findById(decoded.id).select("-password").maxTimeMS(2500);
      if (user) {
        if (
          typeof decoded.tokenVersion === "number" &&
          (user.tokenVersion || 0) !== decoded.tokenVersion
        ) {
          return res.status(401).json({ success: false, message: "Session expired or revoked, please log in again" });
        }
        req.user = user;
      }
    } catch (error) {}

    return next();
  }

  return res.status(401).json({ success: false, message: "Not authorized, please log in" });
};

// Middleware to restrict access to specified roles (RBAC)
const authorize = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!req.user || (roles.length > 0 && !roles.includes(userRole))) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access denied for role '${userRole || "unauthenticated"}'. Required role: [${roles.join(", ")}]`,
      });
    }
    next();
  };
};

module.exports = {
  signToken,
  signRefreshToken,
  verifyToken,
  protect,
  authorize,
};
