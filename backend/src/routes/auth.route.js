import express from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { signupSchema, signinSchema } from '../validation/auth.validation.js';
import { signup, signin } from '../controllers/auth.controller.js';
import { asynchandler } from '../utils/AsyncHandler.js';
const router = express.Router();

router.post("/signup", validate(signupSchema), asynchandler(signup))
router.post("/signin", validate(signinSchema), asynchandler(signin))

export default router;