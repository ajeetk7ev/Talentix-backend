import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export class BillingService {
    static async getPlans() {
        return await prisma.plan.findMany({
            orderBy: { price: 'asc' }
        });
    }

    static async submitPayment(userId, data) {
        const { planId, transactionId, screenshotUrl, amount } = data;

        // Check if plan exists
        const plan = await prisma.plan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            throw new ApiError(404, "Plan not found");
        }

        // Check for duplicate transaction ID
        const existingRequest = await prisma.subscriptionRequest.findUnique({
            where: { transactionId }
        });

        if (existingRequest) {
            throw new ApiError(400, "Transaction ID already submitted");
        }

        return await prisma.subscriptionRequest.create({
            data: {
                userId,
                planId,
                transactionId,
                screenshotUrl,
                amount: parseInt(amount),
                status: 'PENDING'
            },
            include: {
                plan: true
            }
        });
    }

    static async getPendingRequests() {
        return await prisma.subscriptionRequest.findMany({
            where: { status: 'PENDING' },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                },
                plan: true
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    static async approveSubscription(requestId) {
        const request = await prisma.subscriptionRequest.findUnique({
            where: { id: requestId },
            include: { plan: true }
        });

        if (!request) {
            throw new ApiError(404, "Subscription request not found");
        }

        if (request.status !== 'PENDING') {
            throw new ApiError(400, `Request is already ${request.status}`);
        }

        const durationInMonths = request.plan.duration;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + durationInMonths);

        // Transaction to update both User and Request
        const [updatedUser, updatedRequest] = await prisma.$transaction([
            prisma.user.update({
                where: { id: request.userId },
                data: {
                    planId: request.planId,
                    planExpiry: expiryDate
                }
            }),
            prisma.subscriptionRequest.update({
                where: { id: requestId },
                data: { status: 'APPROVED' }
            })
        ]);

        return { user: updatedUser, request: updatedRequest };
    }

    static async rejectSubscription(requestId) {
        const request = await prisma.subscriptionRequest.findUnique({
            where: { id: requestId }
        });

        if (!request) {
            throw new ApiError(404, "Subscription request not found");
        }

        return await prisma.subscriptionRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' }
        });
    }
}
