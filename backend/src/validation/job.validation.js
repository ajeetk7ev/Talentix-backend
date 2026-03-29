import joi from 'joi';

export const createJobSchema = joi.object({
    title: joi.string().required().messages({
        'string.empty': 'Job title cannot be empty',
        'any.required': 'Job title is required'
    }),
    description: joi.string().required().messages({
        'string.empty': 'Job description cannot be empty',
        'any.required': 'Job description is required'
    }),
    company: joi.string().required().messages({
        'string.empty': 'Company name cannot be empty',
        'any.required': 'Company name is required'
    }),
    location: joi.string().required().messages({
        'string.empty': 'Location cannot be empty',
        'any.required': 'Location is required'
    }),
    jobType: joi.string().valid('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT').required().messages({
        'any.only': 'Job type must be one of: FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT',
        'any.required': 'Job type is required'
    }),
    skills: joi.array().items(joi.string()).min(1).required().messages({
        'array.min': 'At least one skill is required',
        'any.required': 'Skills are required'
    }),
    salaryMin: joi.number().optional(),
    salaryMax: joi.number().optional(),
    isRemote: joi.boolean().optional()
});

export const updateJobSchema = joi.object({
    title: joi.string().optional(),
    description: joi.string().optional(),
    company: joi.string().optional(),
    location: joi.string().optional(),
    jobType: joi.string().valid('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT').optional(),
    skills: joi.array().items(joi.string()).optional(),
    salaryMin: joi.number().optional(),
    salaryMax: joi.number().optional(),
    isRemote: joi.boolean().optional()
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});
