import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { publishMessage } from '../config/rabbitmq.config.js';

export class JobService {
    static async createJob(userId, role, data) {
        if (role !== 'ADMIN' && role !== 'CANDIDATE') {
            throw new ApiError(403, "Invalid role for posting jobs");
        }

        const { title, description, company, location, jobType, skills, salaryMin, salaryMax, isRemote } = data;
        const category = role === 'ADMIN' ? 'PREMIUM' : 'COMMUNITY';
        const isCommunityPost = role === 'CANDIDATE';

        const job = await prisma.job.create({
            data: {
                title,
                description,
                company,
                location,
                jobType,
                salaryMin,
                salaryMax,
                isRemote: isRemote || false,
                category,
                isCommunityPost,
                postedById: userId,
                skills: {
                    create: (skills || []).map(skill => ({ skill }))
                }
            },
            include: {
                skills: true,
                postedBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        // Notification Logic for Premium Jobs
        if (category === 'PREMIUM' && skills && skills.length > 0) {
            // Find candidates with matching skills
            // This is a simple implementation: find users who have at least one of the job skills in their profile
            const matchingUsers = await prisma.user.findMany({
                where: {
                    role: 'CANDIDATE',
                    profile: {
                        skills: {
                            hasSome: skills
                        }
                    }
                },
                select: { id: true }
            });

            if (matchingUsers.length > 0) {
                const notifications = matchingUsers.map(user => ({
                    userId: user.id,
                    title: "New Premium Job Match",
                    message: `A new job "${title}" at ${company} matches your skills!`,
                }));

                await prisma.notification.createMany({
                    data: notifications
                });
            }
        }

        // Fan-out notifications safely via background RabbitMQ worker
        if (skills && skills.length > 0) {
            await publishMessage('job_alerts', {
                jobId: job.id,
                title: job.title,
                company: job.company,
                skills: skills
            });
        }

        return job;
    }

    static async getAllJobs(query) {
        const { page = 1, limit = 10, search, location, jobType, category, minSalary, maxSalary, sort = 'latest' } = query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const whereClause = { isExpired: false };

        if (category) {
            whereClause.category = category;
        }

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (location) {
            whereClause.location = { contains: location, mode: 'insensitive' };
        }

        if (jobType) {
            whereClause.jobType = jobType;
        }

        if (minSalary || maxSalary) {
            whereClause.AND = [];
            if (minSalary) {
                whereClause.AND.push({
                    OR: [
                        { salaryMax: { gte: parseInt(minSalary) } },
                        { salaryMin: { gte: parseInt(minSalary) } }
                    ]
                });
            }
            if (maxSalary) {
                whereClause.AND.push({
                    OR: [
                        { salaryMin: { lte: parseInt(maxSalary) } },
                        { salaryMax: { lte: parseInt(maxSalary) } }
                    ]
                });
            }
        }

        let orderBy = {};
        if (sort === 'latest') {
            orderBy = { createdAt: 'desc' };
        } else if (sort === 'oldest') {
            orderBy = { createdAt: 'asc' };
        } else if (sort === 'most_upvoted') {
            orderBy = {
                votes: {
                    _count: 'desc'
                }
            };
        } else {
            orderBy = { createdAt: 'desc' };
        }

        const total = await prisma.job.count({ where: whereClause });
        const jobs = await prisma.job.findMany({
            where: whereClause,
            skip,
            take,
            orderBy,
            include: {
                skills: true,
                postedBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        return {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            jobs
        };
    }

    static async getJobById(id) {
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                skills: true,
                postedBy: {
                    select: { id: true, name: true, email: true }
                }
            }
        });

        if (!job) {
            throw new ApiError(404, "Job not found");
        }

        return job;
    }

    static async updateJob(id, userId, data) {
        const job = await prisma.job.findUnique({ where: { id } });

        if (!job) {
            throw new ApiError(404, "Job not found");
        }

        if (job.postedById !== userId) {
            throw new ApiError(403, "You do not have permission to update this job");
        }

        const { skills, ...updateData } = data;

        const updatedJob = await prisma.job.update({
            where: { id },
            data: {
                ...updateData,
                ...(skills && {
                    skills: {
                        deleteMany: {}, 
                        create: skills.map(skill => ({ skill }))
                    }
                })
            },
            include: {
                skills: true
            }
        });

        return updatedJob;
    }

    static async deleteJob(id, userId) {
        const job = await prisma.job.findUnique({ where: { id } });

        if (!job) {
            throw new ApiError(404, "Job not found");
        }

        if (job.postedById !== userId) {
            throw new ApiError(403, "You do not have permission to delete this job");
        }

        // Must delete related records manually since cascade delete is missing
        await prisma.$transaction([
            prisma.jobSkill.deleteMany({ where: { jobId: id } }),
            prisma.application.deleteMany({ where: { jobId: id } }),
            prisma.vote.deleteMany({ where: { jobId: id } }),
            prisma.comment.deleteMany({ where: { jobId: id } }),
            prisma.report.deleteMany({ where: { jobId: id } }),
            prisma.jobMatch.deleteMany({ where: { jobId: id } }),
            prisma.savedJob.deleteMany({ where: { jobId: id } }),
            prisma.job.delete({ where: { id } })
        ]);

        return { message: "Job deleted successfully" };
    }

    static async toggleSaveJob(userId, jobId) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new ApiError(404, "Job not found");

        const existingSave = await prisma.savedJob.findUnique({
            where: {
                userId_jobId: { userId, jobId }
            }
        });

        if (existingSave) {
            await prisma.savedJob.delete({
                where: { userId_jobId: { userId, jobId } }
            });
            return { message: "Job removed from saved list" };
        } else {
            await prisma.savedJob.create({
                data: { userId, jobId }
            });
            return { message: "Job saved successfully" };
        }
    }

    static async getSavedJobs(userId) {
        const savedJobs = await prisma.savedJob.findMany({
            where: { userId },
            include: {
                job: {
                    include: {
                        skills: true,
                        postedBy: { select: { id: true, name: true, email: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return savedJobs.map(s => s.job); // Extract natively
    }
}
