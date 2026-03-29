import { CompanyService } from '../services/company.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const registerCompany = async (req, res) => {
    const company = await CompanyService.createCompany(req.user.id, req.body);
    return res.status(201).json(new ApiResponse(201, "Company registered successfully and recruiter linked", company));
};

export const getCompany = async (req, res) => {
    const company = await CompanyService.getCompanyById(req.params.id);
    return res.status(200).json(new ApiResponse(200, "Company ecosystem fetched", company));
};

export const updateCompany = async (req, res) => {
    const company = await CompanyService.updateCompany(req.user.id, req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, "Company updated dynamically", company));
};

export const uploadCompanyLogo = async (req, res) => {
    if (!req.file) throw new ApiError(400, "Please upload a valid image file");
    
    // Explicitly update leveraging strict constraint checks natively
    const fileUrl = `/uploads/${req.file.filename}`;
    const company = await CompanyService.updateCompany(req.user.id, req.params.id, { logo: fileUrl });
    
    return res.status(200).json(new ApiResponse(200, "Company Logo uploaded securely", company));
};
