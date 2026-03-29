import { ApplicationService } from '../services/application.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const applyToJob = async (req, res) => {
    const { resumeId } = req.body;
    const application = await ApplicationService.applyToJob(req.user.id, req.params.jobId, resumeId);
    return res.status(201).json(new ApiResponse(201, "Successfully applied for the job", application));
};

export const getJobApplicants = async (req, res) => {
    const applicants = await ApplicationService.getJobApplicants(req.user.id, req.params.jobId);
    return res.status(200).json(new ApiResponse(200, "Applicants fetched successfully", applicants));
};

export const updateStatus = async (req, res) => {
    const updated = await ApplicationService.updateStatus(req.user.id, req.params.id, req.body.status);
    return res.status(200).json(new ApiResponse(200, "Application status updated", updated));
};

export const getUserApplications = async (req, res) => {
    const applications = await ApplicationService.getUserApplications(req.user.id);
    return res.status(200).json(new ApiResponse(200, "My applications fetched successfully", applications));
};

export const bulkRejectUnreviewed = async (req, res) => {
    const result = await ApplicationService.bulkRejectUnreviewed(req.user.id, req.params.jobId);
    return res.status(200).json(new ApiResponse(200, `Successfully bulk rejected ${result.count} unreviewed candidates`, result));
};
