import { AdminService } from '../services/admin.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const getAllReports = async (req, res) => {
    const reports = await AdminService.getReports();
    return res.status(200).json(new ApiResponse(200, "Scam reports retrieved successfully", reports));
};

export const deleteFlaggedJob = async (req, res) => {
    const result = await AdminService.flagOrDeleteJob(req.params.id);
    return res.status(200).json(new ApiResponse(200, result.message));
};
