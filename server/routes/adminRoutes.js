import express from "express"
import {protect} from "../middleware/authMiddleware"
import {authorize} from "../middleware/roleMiddleware"

import {
    getApprovers,
    createVenue,
    updateVenue,
    deactivateVenue,
    assignApprover,
} from "../controllers/adminControllers"

router.use(protect)
router.use(authorize("admin"))

router.get("/approvers",getApprover)
router.post("/venues",createVenue)
router.patch("/venues/:id/deactivate",deactivateVenue)
router.patch("/venues/:id/approver",assignApprover)

export default router