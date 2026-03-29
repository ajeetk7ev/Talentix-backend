import { ProfileService } from '../services/profile.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const getMyProfile = async (req, res) => {
    const profileData = await ProfileService.getProfile(req.user.id);
    return res.status(200).json(new ApiResponse(200, "Profile fetched successfully", profileData));
};

export const updateMyProfile = async (req, res) => {
    const updatedProfile = await ProfileService.updateProfile(req.user.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Profile updated successfully", updatedProfile));
};

export const uploadAvatar = async (req, res) => {
    if (!req.file) throw new ApiError(400, "Please upload an image file");
    
    // Uses local storage URL binding
    const fileUrl = `/uploads/${req.file.filename}`;
    const updatedProfile = await ProfileService.updateProfile(req.user.id, { avatar: fileUrl });
    
    return res.status(200).json(new ApiResponse(200, "Avatar uploaded successfully", updatedProfile));
};

export const addWorkExperience = async (req, res) => {
    const data = await ProfileService.addWorkExperience(req.user.id, req.body);
    return res.status(201).json(new ApiResponse(201, "Experience added successfully", data));
};

export const deleteWorkExperience = async (req, res) => {
    await ProfileService.deleteWorkExperience(req.user.id, req.params.id);
    return res.status(200).json(new ApiResponse(200, "Experience deleted successfully"));
};
