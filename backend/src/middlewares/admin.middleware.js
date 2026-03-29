import { ApiError } from "../utils/ApiError.js";

export const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'ADMIN') {
        throw new ApiError(403, "Access denied. Action requires Admin privileges.");
    }
    next();
};
