import admin from "../config/firebaseAdmin.js";
import { errorResponse } from "../utils/responseFormatter.js";

/**
 * Verifies the Firebase ID token supplied in the Authorization header.
 *
 * Expected header format:
 *   Authorization: Bearer <firebase-id-token>
 *
 * On success  → decoded token is attached to req.user and next() is called.
 * On failure  → 401 JSON error response is returned immediately.
 */
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization ?? "";

        if (!authHeader.startsWith("Bearer ")) {
            return res
                .status(401)
                .json(errorResponse("Unauthorized: missing or malformed token."));
        }

        const idToken = authHeader.split(" ")[1];

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;

        next();
    } catch (err) {
        return res
            .status(401)
            .json(errorResponse("Unauthorized: invalid or expired token."));
    }
};
