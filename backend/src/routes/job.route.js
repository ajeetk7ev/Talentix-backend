import express from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createJobSchema, updateJobSchema } from '../validation/job.validation.js';
import { createJob, getAllJobs, getJobById, updateJob, deleteJob, toggleSaveJob, getSavedJobs } from '../controllers/job.controller.js';
import { asynchandler } from '../utils/AsyncHandler.js';

const router = express.Router();

router.post("/", authMiddleware, validate(createJobSchema), asynchandler(createJob));
router.get("/", asynchandler(getAllJobs));
router.get("/saved", authMiddleware, asynchandler(getSavedJobs));
router.get("/:id", asynchandler(getJobById));
router.patch("/:id", authMiddleware, validate(updateJobSchema), asynchandler(updateJob));
router.delete("/:id", authMiddleware, asynchandler(deleteJob));
router.post("/:jobId/save", authMiddleware, asynchandler(toggleSaveJob));

export default router;
