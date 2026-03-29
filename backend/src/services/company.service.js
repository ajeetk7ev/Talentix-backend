import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export class CompanyService {
    static async createCompany(userId, data) {
        // Prevent generic users from establishing corporations natively
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.role !== 'RECRUITER') throw new ApiError(403, "Only verified Recruiters can register Companies");

        // Transaction recursively binding Recruiter precisely inside newly formed Company
        return await prisma.$transaction(async (tx) => {
            const company = await tx.company.create({
                data: {
                    ...data
                }
            });

            await tx.user.update({
                where: { id: userId },
                data: { companyId: company.id }
            });

            return company;
        });
    }

    static async getCompanyById(companyId) {
        const company = await prisma.company.findUnique({
            where: { id: companyId },
            include: {
                jobs: {
                    where: { isExpired: false },
                    orderBy: { createdAt: 'desc' }
                },
                recruiters: {
                    select: { name: true, email: true, id: true }
                }
            }
        });

        if (!company) throw new ApiError(404, "Company entity not found");
        return company;
    }

    static async updateCompany(userId, companyId, data) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user.companyId !== companyId) throw new ApiError(403, "Access Denied. You do not belong to this Company.");

        return await prisma.company.update({
            where: { id: companyId },
            data: { ...data }
        });
    }
}
