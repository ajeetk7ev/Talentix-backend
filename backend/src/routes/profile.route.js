import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateProfileSchema, addExperienceSchema } from '../validation/profile.validation.js';
import { getMyProfile, updateMyProfile, uploadAvatar, addWorkExperience, deleteWorkExperience } from '../controllers/profile.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { asynchandler } from '../utils/AsyncHandler.js';

const router = express.Router();

router.get("/me", authMiddleware, asynchandler(getMyProfile));
router.patch("/me", authMiddleware, validate(updateProfileSchema), asynchandler(updateMyProfile));
router.put("/me/avatar", authMiddleware, upload.single('avatar'), asynchandler(uploadAvatar));
router.post("/me/experience", authMiddleware, validate(addExperienceSchema), asynchandler(addWorkExperience));
router.delete("/me/experience/:id", authMiddleware, asynchandler(deleteWorkExperience));

export default router;
