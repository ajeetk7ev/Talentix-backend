import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export class NotificationService {
    static async getMyNotifications(userId) {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20 
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        return { notifications, unreadCount };
    }

    static async markAsRead(notificationId, userId) {
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId }
        });

        if (!notification) throw new ApiError(404, "Notification not found");
        if (notification.userId !== userId) throw new ApiError(403, "Access denied");

        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true }
        });

        return updated;
    }
}
