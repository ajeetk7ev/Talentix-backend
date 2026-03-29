import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { publishMessage } from '../config/rabbitmq.config.js';

export class ApplicationService {
    static async applyToJob(userId, jobId, resumeId) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new ApiError(404, "Job not found");

        if (!resumeId) throw new ApiError(400, "Please explicitly select a resume to apply with");

        const resume = await prisma.resume.findUnique({
            where: { id: resumeId }
        });
        
        if (!resume || resume.userId !== userId) throw new ApiError(400, "Invalid resume selection");

        const existingApplication = await prisma.application.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId
                }
            }
        });

        if (existingApplication) throw new ApiError(400, "You have already applied to this job");

        const application = await prisma.application.create({
            data: {
                userId,
                jobId,
                resumeId,  // Link specific resume implicitly
                status: 'APPLIED'
            }
        });

        return application;
    }

    static async getJobApplicants(recruiterId, jobId) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new ApiError(404, "Job not found");
        if (job.postedById !== recruiterId) throw new ApiError(403, "You do not have permission to view these applicants");

        const applicants = await prisma.application.findMany({
            where: { jobId },
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        resumes: {
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });

        return applicants;
    }

    static async updateStatus(recruiterId, applicationId, status) {
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { job: true }
        });

        if (!application) throw new ApiError(404, "Application not found");
        if (application.job.postedById !== recruiterId) throw new ApiError(403, "You do not have permission to update this application");

        const updated = await prisma.application.update({
            where: { id: applicationId },
            data: { status }
        });

        // Trigger recruiter action user notification via RabbitMQ async queue
        await publishMessage('application_alerts', {
            userId: application.userId,
            title: "Application Status Updated",
            message: `Your application for ${application.job.title} at ${application.job.company} was just moved to ${status}`
        });

        return updated;
    }

    static async getUserApplications(userId) {
        const applications = await prisma.application.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                job: {
                    select: { id: true, title: true, company: true, location: true }
                }
            }
        });
        return applications;
    }

    static async bulkRejectUnreviewed(recruiterId, jobId) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new ApiError(404, "Job not found");
        if (job.postedById !== recruiterId) throw new ApiError(403, "Access denied. Only the job owner can bulk reject candidates.");

        // Sweep natively where status is explicitly 'APPLIED' targeting unreviewed applicants
        const result = await prisma.application.updateMany({
            where: {
                jobId: jobId,
                status: 'APPLIED' 
            },
            data: {
                status: 'REJECTED'
            }
        });

        return result;
    }
}
