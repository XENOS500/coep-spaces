import { Router } from "express";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

import {
  getPendingApprovals,
  updateApprovalStatus,
} from "../controllers/approvalController.js";

const router = Router();

router.use(protect);
router.use(authorize("APPROVER"));

router.get("/pending", getPendingApprovals);
router.patch("/:id", updateApprovalStatus);

export default router;