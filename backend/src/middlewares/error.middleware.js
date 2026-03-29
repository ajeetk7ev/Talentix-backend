import { logger } from "../config/logger.js";

export const errorMiddleware = (err, _req, res, next) => {
    const statusCode = err.statusCode || 500;

    logger.error({
        message:err.message,
        statusCode,
        stack:err.stack,
        errors:err.errors || {}
    })

    return res.status(statusCode).json({
        success:false,
        message:err.message || "Internal Server Error",
        errors:err.errors || {}
    })
}