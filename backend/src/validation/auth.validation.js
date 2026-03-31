import joi from 'joi';

export const signupSchema = joi.object({
    name: joi.string().required().messages({
        'string.empty': 'Name cannot be empty',
        'any.required': 'Name is required'
    }),
    email: joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email cannot be empty',
        'any.required': 'Email is required'
    }),
    password: joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.empty': 'Password cannot be empty',
        'any.required': 'Password is required'
    }),
    role: joi.string().valid('CANDIDATE', 'ADMIN').optional().messages({
        'any.only': 'Role must be one of: CANDIDATE, ADMIN'
    })
});

export const signinSchema = joi.object({
    email: joi.string().email().required().messages({
        'string.email': 'Please enter a valid email address',
        'string.empty': 'Email cannot be empty',
        'any.required': 'Email is required'
    }),
    password: joi.string().required().messages({
        'string.empty': 'Password cannot be empty',
        'any.required': 'Password is required'
    })
});
