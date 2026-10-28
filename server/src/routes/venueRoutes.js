import { Router } from "express";
import { getVenues, getVenueById } from "../controllers/venueController";

import { protect } from "../middleware/authMiddleware";

const router = Router();

router.use(protect);

router.get("/", getVenues);

router.get("/:id", getVenueById);

export default router;
