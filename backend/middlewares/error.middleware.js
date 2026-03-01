import { errorResponse } from "../utils/responseFormatter.js";

/**
 * 404 handler — catches any request that fell through all routes.
 */
export const notFoundHandler = (_req, res) => {
    res.status(404).json(errorResponse("Route not found."));
};

/**
 * Global error handler — must be registered last in the middleware chain.
 * Express identifies it as an error handler via the 4-argument signature.
 *
 * @param {Error}    err
 * @param {import("express").Request}  _req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} _next
 */
// eslint-disable-next-line no-unused-vars
export const globalErrorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode ?? 500;
    const message =
        process.env.NODE_ENV === "production"
            ? "Internal server error."
            : (err.message ?? "Internal server error.");

    console.error(`[ERROR] ${err.stack ?? err.message}`);

    res.status(statusCode).json(errorResponse(message));
};
