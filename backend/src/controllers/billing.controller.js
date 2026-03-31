import { BillingService } from '../services/billing.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getPlans = async (req, res) => {
    const plans = await BillingService.getPlans();
    return res.status(200).json(new ApiResponse(200, "Plans fetched successfully", plans));
};

export const submitPayment = async (req, res) => {
    const { planId, transactionId, amount } = req.body;
    const screenshotUrl = req.file?.path;

    if (!screenshotUrl) {
        return res.status(400).json(new ApiResponse(400, "Payment screenshot is required"));
    }

    const request = await BillingService.submitPayment(req.user.id, {
        planId,
        transactionId,
        amount,
        screenshotUrl
    });

    return res.status(201).json(new ApiResponse(201, "Subscription request submitted for verification", request));
};

export const getPendingRequests = async (req, res) => {
    const requests = await BillingService.getPendingRequests();
    return res.status(200).json(new ApiResponse(200, "Pending requests fetched", requests));
};

export const approveSubscription = async (req, res) => {
    const { requestId } = req.params;
    const result = await BillingService.approveSubscription(requestId);
    return res.status(200).json(new ApiResponse(200, "Subscription approved/activated", result));
};

export const rejectSubscription = async (req, res) => {
    const { requestId } = req.params;
    const result = await BillingService.rejectSubscription(requestId);
    return res.status(200).json(new ApiResponse(200, "Subscription rejected", result));
};
