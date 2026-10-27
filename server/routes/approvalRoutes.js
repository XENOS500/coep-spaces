import {Router} from "express"

import {protect} from "../middleware/authMiddleware"
import {authorize} from "../middleware/roleMiddleware"

import {
    getPendingApprovals,
    updateApprovalStatus
} from "../controllers/approvalController"

const router =Router()

router.use(protect)
router.use(authorize("approver"))

router.get("/pending",getPendingApprovals)

router.patch("/:id,updateApprovalStatus")

export default router;