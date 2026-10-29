import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  getAdminVenues,
  getAdminVenue,
  promoteApprover,
  getApprover,
  createVenue,
  updateVenue,
  deactivateVenue,
  assignApprover,
} from "../controllers/adminController.js";

const router = Router();

router.use(protect);
router.use(authorize("ADMIN"));

router.get("/approvers", getApprover);
router.post("/approvers", promoteApprover);
router.get("/venues", getAdminVenues);
router.get("/venues/:id", getAdminVenue);
router.post("/venues", createVenue);
router.patch("/venues/:id", updateVenue);
router.patch("/venues/:id/deactivate", deactivateVenue);
router.patch("/users/:id/approver", assignApprover);

export default router;
