import { NotificationService } from '../services/notification.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getMyNotifications = async (req, res) => {
    const data = await NotificationService.getMyNotifications(req.user.id);
    return res.status(200).json(new ApiResponse(200, "Notifications fetched successfully", data));
};

export const markAsRead = async (req, res) => {
    const data = await NotificationService.markAsRead(req.params.id, req.user.id);
    return res.status(200).json(new ApiResponse(200, "Notification marked as read", data));
};
