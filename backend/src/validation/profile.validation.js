import joi from 'joi';

export const updateProfileSchema = joi.object({
    bio: joi.string().max(500).optional().allow(''),
    location: joi.string().max(100).optional().allow(''),
    skills: joi.array().items(joi.string()).optional(),
    experience: joi.number().integer().min(0).optional(),
    github: joi.string().uri().optional().allow(''),
    linkedin: joi.string().uri().optional().allow(''),
    portfolio: joi.string().uri().optional().allow(''),
    preferredLocation: joi.array().items(joi.string()).optional(),
    education: joi.string().max(255).optional().allow(''),
    currentSalary: joi.number().integer().min(0).optional(),
    expectedSalary: joi.number().integer().min(0).optional(),
    noticePeriod: joi.string().max(100).optional().allow('')
});

export const addExperienceSchema = joi.object({
    company: joi.string().max(100).required(),
    role: joi.string().max(100).required(),
    startDate: joi.date().iso().required(),
    endDate: joi.date().iso().optional().allow(null),
    description: joi.string().max(1000).optional().allow('')
});
