import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { redisClient } from '../config/redis.config.js';

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return next(new ApiError(401, "Unauthorized request"));
        }

        if (redisClient.isOpen) {
            const isBlacklisted = await redisClient.get(`blacklist_${token}`);
            if (isBlacklisted) {
                return next(new ApiError(401, "Session Expired. Please login again."));
            }
        }

        const decodedToken = jwt.verify(token, env.JWT_SECRET);
        req.user = decodedToken;
        next();
    } catch (error) {
        return next(new ApiError(401, "Invalid access token"));
    }
};
