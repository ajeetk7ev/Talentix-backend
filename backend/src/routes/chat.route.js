import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { establishRoom, getMyRooms, getRoomMessages } from '../controllers/chat.controller.js';
import { asynchandler } from '../utils/AsyncHandler.js';

const router = express.Router();

router.use(authMiddleware);

router.post("/rooms", asynchandler(establishRoom));
router.get("/rooms", asynchandler(getMyRooms));
router.get("/rooms/:roomId/messages", asynchandler(getRoomMessages));

export default router;
