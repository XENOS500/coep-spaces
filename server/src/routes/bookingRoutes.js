import {Router} from "express"
import {
  checkAvailability,
  createBooking,
  getMyBookings,
  cancelBooking,
  getVenueBookings,
} from "../controllers/bookingController.js";

// ---- REAL AUTH (switch to this once the middleware files exist) ----
// import { protect } from "../middleware/authMiddleware.js";
// import { authorize } from "../middleware/roleMiddleware.js";
// router.use(protect);

// ---- TEMPORARY AUTH FOR POSTMAN TESTING (delete when login works) ----
const fakeAuth = (req, res, next) => {
  req.user = { id: process.env.TEST_USER_ID };
  next();
};

const router= Router()

router.use(fakeAuth) // for postman check

router.get("/availability",checkAvailability)
//When real auth is on, restrict the rest to requesters:
//router.use(authorize("requester")); //iske nicheke endpoints sirf requester access kar sakta hai

router.get("/my",getMyBookings) 

router.post("/",createBooking)

router.patch("/:id/cancel",cancelBooking)

export default router


