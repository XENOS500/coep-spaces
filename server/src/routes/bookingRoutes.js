import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  checkAvailability,
  createBooking,
  getMyBookings,
  cancelBooking,
  getVenueBookings,
} from "../controllers/bookingController.js";

const router = Router();

router.use(protect);

router.get("/availability", checkAvailability);
router.get("/venue/:venueId", getVenueBookings);
router.get("/my", getMyBookings);
router.post("/", authorize("REQUESTER"), createBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;
