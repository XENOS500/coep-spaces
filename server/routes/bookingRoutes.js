import {Router} from "express"

import {protect} from "../middleware/authMiddleware"
import {authorize} from "../middleware/roleMiddleware"

import {
  checkAvailability,
  createBooking,
  getMyBookings,
  cancelBooking,
} from "../controllers/bookingController"

const router= Router()

router.use(protect) // for authentication

router.get("/availability",checkAvailability)

router.use(authorize("requester")); //iske nicheke endpoints sirf requester access kar sakta hai

router.get("/my",getMyBookings) 

router.post("/",createBooking)

router.patch("/:id/cancel",cancelBooking)

export default router


