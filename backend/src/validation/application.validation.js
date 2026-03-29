import joi from 'joi';

export const updateApplicationStatusSchema = joi.object({
    status: joi.string().valid('APPLIED', 'IN_REVIEW', 'REJECTED', 'ACCEPTED').required().messages({
        'any.only': 'Status must be one of APPLIED, IN_REVIEW, REJECTED, ACCEPTED',
        'any.required': 'Status is required'
    })
});

export const applyToJobSchema = joi.object({
    resumeId: joi.string().uuid().required().messages({
        'any.required': 'Please select a resume to apply with'
    })
});
