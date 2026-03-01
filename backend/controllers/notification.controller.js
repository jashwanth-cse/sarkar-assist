import { registerFcmToken } from "../services/notification.service.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";

/**
 * POST /api/v1/notifications/register-token
 *
 * Registers an FCM WebPush token for the authenticated user.
 * Deduplicates and enforces a max of 5 tokens per user.
 *
 * Body: { token: string }
 */

export const registerToken = async (req, res, next) => {
    try {
        const { token } = req.body ?? {};

        if (!token || typeof token !== "string" || token.trim().length === 0) {
            return res
                .status(400)
                .json(errorResponse('Field "token" is required and must be a non-empty string.'));
        }

        const outcome = await registerFcmToken(req.user.uid, token.trim());

        const messages = {
            added: "FCM token registered successfully.",
            exists: "FCM token already registered.",
            evicted: "FCM token registered. Oldest token removed to stay within the 5-token limit.",
        };

        return res.status(200).json(
            successResponse({ message: messages[outcome], outcome })
        );
    } catch (err) {
        next(err);
    }
};
