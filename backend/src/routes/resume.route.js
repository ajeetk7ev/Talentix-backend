import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { uploadResume, getMyResumes, deleteResume } from '../controllers/resume.controller.js';
import { asynchandler } from '../utils/AsyncHandler.js';

const router = express.Router();

router.get("/", authMiddleware, asynchandler(getMyResumes));
router.post("/upload", authMiddleware, upload.single('resume'), asynchandler(uploadResume));
router.delete("/:id", authMiddleware, asynchandler(deleteResume));

export default router;
