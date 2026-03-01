import { successResponse } from "../utils/responseFormatter.js";

/**
 * GET /api/v1/protected
 * Accessible only to authenticated users.
 * req.user is populated by auth.middleware.js.
 */
export const getProtected = (_req, res) => {
    res.status(200).json(
        successResponse({
            message: "Access granted",
            uid: _req.user.uid,
        })
    );
};
