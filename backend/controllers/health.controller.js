import { successResponse } from "../utils/responseFormatter.js";

/**
 * GET /api/v1/health
 * Returns a simple liveness payload confirming the service is up.
 */
export const getHealth = (_req, res) => {
    res.status(200).json(
        successResponse({
            status: "ok",
            uptime: process.uptime(),
        })
    );
};
