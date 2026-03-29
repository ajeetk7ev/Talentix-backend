import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export class ChatService {
    static async getOrCreateRoom(userId, receiverId, jobId) {
        // Enforce bidirectional room search
        let room = await prisma.chatRoom.findFirst({
            where: {
                OR: [
                    { recruiterId: userId, candidateId: receiverId, jobId },
                    { recruiterId: receiverId, candidateId: userId, jobId }
                ]
            }
        });

        if (!room) {
            // Determine roles explicitly based on platform identity logic. 
            // Usually the initiator might be the recruiter, but we assume receiver is candidate
            // For rigorous checks, we query user roles dynamically
            const user1 = await prisma.user.findUnique({ where: { id: userId }});
            const user2 = await prisma.user.findUnique({ where: { id: receiverId }});

            if (!user1 || !user2) throw new ApiError(404, "Invalid chat targets");

            const recruiterId = user1.role === 'RECRUITER' ? user1.id : user2.id;
            const candidateId = user1.role === 'RECRUITER' ? user2.id : user1.id;

            room = await prisma.chatRoom.create({
                data: {
                    recruiterId,
                    candidateId,
                    jobId
                }
            });
        }
        return room;
    }

    static async getMyRooms(userId) {
        return await prisma.chatRoom.findMany({
            where: {
                OR: [
                    { recruiterId: userId },
                    { candidateId: userId }
                ]
            },
            include: {
                recruiter: { select: { id: true, name: true, avatar: true } },
                candidate: { select: { id: true, name: true, avatar: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1 // Only fetch the last preview message for the Sidebar natively!
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    }

    static async getRoomMessages(roomId, userId) {
        // Validate access natively
        const room = await prisma.chatRoom.findUnique({ where: { id: roomId }});
        if (!room) throw new ApiError(404, "Chat Room missing");
        if (room.recruiterId !== userId && room.candidateId !== userId) {
            throw new ApiError(403, "You do not belong to this encrypted ChatRoom");
        }

        // Mark unread messages as read asynchronously using fire-and-forget
        prisma.message.updateMany({
            where: { chatId: roomId, senderId: { not: userId }, isRead: false },
            data: { isRead: true }
        }).catch(()=>null);

        return await prisma.message.findMany({
            where: { chatId: roomId },
            orderBy: { createdAt: 'asc' },
            include: { sender: { select: { id: true, name: true } } }
        });
    }
}
