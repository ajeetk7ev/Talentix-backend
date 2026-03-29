import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { companySchema } from '../validation/company.validation.js';
import { registerCompany, getCompany, updateCompany, uploadCompanyLogo } from '../controllers/company.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { asynchandler } from '../utils/AsyncHandler.js';

const router = express.Router();

router.post("/", authMiddleware, validate(companySchema), asynchandler(registerCompany));
router.get("/:id", asynchandler(getCompany));
router.patch("/:id", authMiddleware, validate(companySchema), asynchandler(updateCompany));
router.put("/:id/logo", authMiddleware, upload.single('logo'), asynchandler(uploadCompanyLogo));

export default router;
