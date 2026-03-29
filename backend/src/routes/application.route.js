import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateApplicationStatusSchema, applyToJobSchema } from '../validation/application.validation.js';
import { applyToJob, getJobApplicants, updateStatus, getUserApplications, bulkRejectUnreviewed } from '../controllers/application.controller.js';
import { asynchandler } from '../utils/AsyncHandler.js';

const router = express.Router();

router.post("/jobs/:jobId", authMiddleware, validate(applyToJobSchema), asynchandler(applyToJob));
router.get("/jobs/:jobId/applicants", authMiddleware, asynchandler(getJobApplicants));
router.patch("/jobs/:jobId/bulk-reject", authMiddleware, asynchandler(bulkRejectUnreviewed));
router.patch("/:id/status", authMiddleware, validate(updateApplicationStatusSchema), asynchandler(updateStatus));
router.get("/my-applications", authMiddleware, asynchandler(getUserApplications));

export default router;
