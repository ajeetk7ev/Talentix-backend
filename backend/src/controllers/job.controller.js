import { JobService } from '../services/job.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { redisClient } from '../config/redis.config.js';

export const createJob = async (req, res) => {
    const job = await JobService.createJob(req.user.id, req.user.role, req.body);
    return res.status(201).json(new ApiResponse(201, "Job created successfully", job));
};

export const getAllJobs = async (req, res) => {
    const cacheKey = `jobs:${JSON.stringify(req.query)}`;
    
    if (redisClient.isOpen) {
        const cachedJobs = await redisClient.get(cacheKey);
        if (cachedJobs) {
            return res.status(200).json(new ApiResponse(200, "Jobs fetched successfully (Cached)", JSON.parse(cachedJobs)));
        }
    }

    const data = await JobService.getAllJobs(req.query);

    if (redisClient.isOpen) {
        await redisClient.setEx(cacheKey, 60, JSON.stringify(data));
    }

    return res.status(200).json(new ApiResponse(200, "Jobs fetched successfully", data));
};

export const getJobById = async (req, res) => {
    const job = await JobService.getJobById(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Job fetched successfully", job));
};

export const updateJob = async (req, res) => {
    const job = await JobService.updateJob(req.params.id, req.user.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Job updated successfully", job));
};

export const deleteJob = async (req, res) => {
    const result = await JobService.deleteJob(req.params.id, req.user.id);
    return res.status(200).json(new ApiResponse(200, result.message));
};

export const toggleSaveJob = async (req, res) => {
    const result = await JobService.toggleSaveJob(req.user.id, req.params.jobId);
    return res.status(200).json(new ApiResponse(200, result.message));
};

export const getSavedJobs = async (req, res) => {
    const savedJobs = await JobService.getSavedJobs(req.user.id);
    return res.status(200).json(new ApiResponse(200, "Saved jobs retrieved successfully", savedJobs));
};
