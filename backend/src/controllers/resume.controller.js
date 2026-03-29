import prisma from '../config/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import path from 'path';
import fs from 'fs';

export const uploadResume = async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Please upload a PDF resume file");
    }

    const fileUrl = `/uploads/${req.file.filename}`; 

    const resume = await prisma.resume.create({
        data: {
            userId: req.user.id,
            fileUrl: fileUrl
        }
    });

    return res.status(202).json(new ApiResponse(202, "Resume uploaded successfully", resume));
};

export const getMyResumes = async (req, res) => {
    const resumes = await prisma.resume.findMany({ 
        where: { userId: req.user.id }, 
        orderBy: { createdAt: 'desc' } 
    });
    return res.status(200).json(new ApiResponse(200, "Resumes fetched successfully", resumes));
};

export const deleteResume = async (req, res) => {
    const resume = await prisma.resume.findUnique({ where: { id: req.params.id } });
    if (!resume) throw new ApiError(404, "Resume not found");
    if (resume.userId !== req.user.id) throw new ApiError(403, "Access denied");

    const filename = resume.fileUrl.split('/uploads/')[1];
    if (filename) {
        const filePath = path.join(process.cwd(), 'uploads', filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
    
    await prisma.resume.delete({ where: { id: req.params.id } });
    return res.status(200).json(new ApiResponse(200, "Resume deleted natively"));
};
