import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export class AdminService {
    static async getReports() {
        return await prisma.report.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { name: true, email: true } },
                job: { select: { title: true, company: true } }
            }
        });
    }

    static async flagOrDeleteJob(jobId) {
        const job = await prisma.job.findUnique({ where: { id: jobId } });
        if (!job) throw new ApiError(404, "Target job not found");

        // Execute total DB scrub leveraging cascading logic where applicable
        await prisma.$transaction([
            prisma.jobSkill.deleteMany({ where: { jobId } }),
            prisma.application.deleteMany({ where: { jobId } }),
            prisma.vote.deleteMany({ where: { jobId } }),
            prisma.comment.deleteMany({ where: { jobId } }),
            prisma.report.deleteMany({ where: { jobId } }),
            prisma.savedJob.deleteMany({ where: { jobId } }),
            prisma.jobMatch.deleteMany({ where: { jobId } }),
            prisma.job.delete({ where: { id: jobId } })
        ]);

        return { message: "Scam Job successfully eradicated from the database" };
    }
}
