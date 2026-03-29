import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { getMyNotifications, markAsRead } from '../controllers/notification.controller.js';
import { asynchandler } from '../utils/AsyncHandler.js';

const router = express.Router();

router.get("/", authMiddleware, asynchandler(getMyNotifications));
router.patch("/:id/read", authMiddleware, asynchandler(markAsRead));

export default router;
