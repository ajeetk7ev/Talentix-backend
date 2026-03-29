import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export class CommunityService {
    static async toggleUpvoteJob(userId, jobId) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new ApiError(404, "Job not found");

        const existingVote = await prisma.vote.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId
                }
            }
        });

        if (existingVote) {
             // If they already voted, assuming a toggle acts like a neutralizer or we only support UP votes in this system
             await prisma.vote.delete({ where: { id: existingVote.id } });
             return { message: "Vote removed", voted: false };
        } else {
             await prisma.vote.create({
                 data: {
                     userId,
                     jobId,
                     type: 'UP'
                 }
             });
             return { message: "Job upvoted successfully", voted: true };
        }
    }

    static async addComment(userId, jobId, content, parentId = null) {
        if (!content || content.trim().length === 0) throw new ApiError(400, "Comment cannot be empty");
        
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new ApiError(404, "Job not found");

        const comment = await prisma.comment.create({
            data: {
                userId,
                jobId,
                content,
                parentId: parentId || null
            },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });

        return comment;
    }

    static async getJobComments(jobId) {
        // Fetch top-level comments and nest replies perfectly!
        return await prisma.comment.findMany({
            where: { 
                jobId,
                parentId: null // Only root comments
            },
            orderBy: { createdAt: 'desc' },
            include: {
                 user: { select: { id: true, name: true } },
                 replies: {
                     include: {
                         user: { select: { id: true, name: true } },
                         replies: {
                             include: { user: { select: { id: true, name: true } }}
                         }
                     },
                     orderBy: { createdAt: 'asc' }
                 }
            }
        });
    }
}
