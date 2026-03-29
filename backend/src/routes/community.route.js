import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { toggleUpvoteJob, addComment, getJobComments } from '../controllers/community.controller.js';
import { asynchandler } from '../utils/AsyncHandler.js';

const router = express.Router();

router.post("/jobs/:jobId/upvote", authMiddleware, asynchandler(toggleUpvoteJob));
router.post("/jobs/:jobId/comments", authMiddleware, asynchandler(addComment));
router.get("/jobs/:jobId/comments", asynchandler(getJobComments)); // Viewable publicly

export default router;
