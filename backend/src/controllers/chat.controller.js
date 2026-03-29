import { ChatService } from '../services/chat.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const establishRoom = async (req, res) => {
    const { targetUserId, jobId } = req.body;
    const room = await ChatService.getOrCreateRoom(req.user.id, targetUserId, jobId);
    return res.status(200).json(new ApiResponse(200, "Secure ChatRoom established", room));
};

export const getMyRooms = async (req, res) => {
    const rooms = await ChatService.getMyRooms(req.user.id);
    return res.status(200).json(new ApiResponse(200, "Active ChatRooms retrieved", rooms));
};

export const getRoomMessages = async (req, res) => {
    const messages = await ChatService.getRoomMessages(req.params.roomId, req.user.id);
    return res.status(200).json(new ApiResponse(200, "Chat History loaded perfectly", messages));
};
