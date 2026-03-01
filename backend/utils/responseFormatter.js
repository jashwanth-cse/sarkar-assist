import { API_VERSION } from "../config/apiContract.js";

/**
 * Build a standardised success response envelope.
 * @param {*} data  - Payload to return under `data`.
 * @returns {object}
 */
export const successResponse = (data = {}) => ({
    success: true,
    data,
    meta: {
        version: API_VERSION,
        timestamp: new Date().toISOString(),
    },
});

/**
 * Build a standardised error response envelope.
 * @param {string} message - Human-readable error message.
 * @returns {object}
 */
export const errorResponse = (message = "An unexpected error occurred.") => ({
    success: false,
    error: message,
    meta: {
        version: API_VERSION,
        timestamp: new Date().toISOString(),
    },
});
