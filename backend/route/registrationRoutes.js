const express = require("express");
const router = express.Router();
const {
  registerForEvent,
  getUserRegistrations,
  getEventRegistrations,
  getAllRegistrations,
  updateRegistration,
} = require("../controlers/registrationController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/", registerForEvent);
router.get("/", protect, authorize("admin", "super_admin", "branch_admin"), getAllRegistrations);
router.get("/user/:email", protect, getUserRegistrations);
router.get("/event/:eventId", protect, authorize("admin", "super_admin", "branch_admin"), getEventRegistrations);
router.put("/:id", protect, authorize("admin", "super_admin", "branch_admin"), updateRegistration);

module.exports = router;
