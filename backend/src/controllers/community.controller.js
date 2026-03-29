import { CommunityService } from '../services/community.service.js';
import ApiResponse from '../utils/ApiResponse.js';

export const toggleUpvoteJob = async (req, res) => {
    const result = await CommunityService.toggleUpvoteJob(req.user.id, req.params.jobId);
    return res.status(200).json(new ApiResponse(200, result.message, result));
};

export const addComment = async (req, res) => {
    const { content, parentId } = req.body;
    const comment = await CommunityService.addComment(req.user.id, req.params.jobId, content, parentId);
    return res.status(201).json(new ApiResponse(201, "Comment added successfully", comment));
};

export const getJobComments = async (req, res) => {
    const comments = await CommunityService.getJobComments(req.params.jobId);
    return res.status(200).json(new ApiResponse(200, "Comments fetched successfully", comments));
};
