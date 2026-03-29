import joi from 'joi';

export const companySchema = joi.object({
    name: joi.string().min(2).max(100).required(),
    about: joi.string().max(2000).optional().allow(''),
    website: joi.string().uri().optional().allow(''),
    location: joi.string().max(200).optional().allow('')
});
