import prisma from '../config/prisma.js';

export class ProfileService {
    static async getProfile(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                resumes: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        // Compute Profile Score natively (Naukri style algorithm expanded)
        let score = 5; // Base: 5% for simply having a registered user account

        if (user.profile) {
            if (user.profile.location) score += 5;
            if (user.profile.preferredLocation && user.profile.preferredLocation.length > 0) score += 5;
            if (user.profile.bio) score += 5;
            if (user.profile.experience !== null && user.profile.experience !== undefined) score += 10;
            if (user.profile.education) score += 10;
            if (user.profile.skills && user.profile.skills.length > 0) score += 15;
            if (user.profile.github || user.profile.linkedin || user.profile.portfolio) score += 10;
            if (user.profile.noticePeriod) score += 5;
        }

        const latestResume = user.resumes.length > 0 ? user.resumes[0] : null;
        if (latestResume) {
            score += 30;
        }

        // Always cap cleanly in case of math drift
        score = Math.min(score, 100);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            profile: user.profile || {},
            resume: latestResume,
            completionScore: score
        };
    }

    static async updateProfile(userId, data) {
        const updatedProfile = await prisma.profile.upsert({
            where: {
                userId: userId
            },
            update: {
                ...data
            },
            create: {
                userId: userId,
                ...data
            }
        });

        return updatedProfile;
    }

    static async addWorkExperience(userId, data) {
        let profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) {
            profile = await this.updateProfile(userId, {}); // Ensure it exists natively
        }
        
        return await prisma.workExperience.create({
            data: {
                profileId: profile.id,
                ...data
            }
        });
    }

    static async deleteWorkExperience(userId, experienceId) {
        const profile = await prisma.profile.findUnique({ where: { userId } });
        if (!profile) throw new ApiError(404, "Profile not found");

        const record = await prisma.workExperience.deleteMany({
            where: {
                id: experienceId,
                profileId: profile.id // Secure constraint enforcing ownership natively
            }
        });

        if (record.count === 0) throw new ApiError(404, "Experience not found or unauthorized");
        return record;
    }
}
