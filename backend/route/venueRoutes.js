const express = require("express");
const router = express.Router();
const {
  getVenues,
  createVenue,
  updateVenue,
  deleteVenue,
} = require("../controlers/venueController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", getVenues);
router.post("/", protect, authorize("admin", "super_admin", "branch_admin"), createVenue);
router.put("/:id", protect, authorize("admin", "super_admin", "branch_admin"), updateVenue);
router.delete("/:id", protect, authorize("admin", "super_admin", "branch_admin"), deleteVenue);

module.exports = router;
