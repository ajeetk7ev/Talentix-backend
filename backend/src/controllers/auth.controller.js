import { AuthService } from '../services/auth.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import { generateToken } from '../utils/jwt.js';

export const signup = async (req, res) => {
    const user = await AuthService.signup(req.body);
    
    // Generate Token
    const token = await generateToken(user);

    // Set Cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(201).json(new ApiResponse(201, "User registered successfully", user));
};

export const signin = async (req, res) => {
    const user = await AuthService.signin(req.body);
    
    // Generate Token
    const token = await generateToken(user);

    // Set Cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return res.status(200).json(new ApiResponse(200, "User logged in successfully", user));
};