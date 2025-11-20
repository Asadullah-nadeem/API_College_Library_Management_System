"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('An error occurred:', err.stack || err.message);
    const statusCode = err.status || err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred on the server.';
    res.status(statusCode).json({
        success: false,
        message: message,
        // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};
exports.errorHandler = errorHandler;
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
exports.ApiError = ApiError;
