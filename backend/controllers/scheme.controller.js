import { resolveProfile } from "../services/scheme.service.js";
import { getEligibleSchemes, getPartitionedSchemes } from "../services/eligibility.service.js";
import { getProfile } from "../services/profile.service.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { applyFilters } from "../utils/filterSchemes.js";

// ─── Required profile fields for the stateless endpoint ──────────────────────

const REQUIRED_PROFILE_FIELDS = [
    "dateOfBirth",
    "annualIncome",
    "category",
    "state",
    "gender",
    "isStudent",
    "employmentStatus",
    "isDisabled",
];

/**
 * Validate the incoming profile object has all required fields with correct types.
 * @param {object} profile
 * @returns {string|null} error message or null if valid
 */
const validateProfileBody = (profile) => {
    if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
        return 'Request body must contain a "profile" object.';
    }
    for (const field of REQUIRED_PROFILE_FIELDS) {
        if (profile[field] === undefined || profile[field] === null) {
            return `Missing required profile field: ${field}`;
        }
    }
    if (typeof profile.dateOfBirth !== "string") return '"dateOfBirth" must be a string (YYYY-MM-DD)';
    if (typeof profile.annualIncome !== "number") return '"annualIncome" must be a number';
    if (typeof profile.isStudent !== "boolean") return '"isStudent" must be a boolean';
    if (typeof profile.isDisabled !== "boolean") return '"isDisabled" must be a boolean';
    if (typeof profile.category !== "string") return '"category" must be a string';
    if (typeof profile.state !== "string") return '"state" must be a string';
    if (typeof profile.gender !== "string") return '"gender" must be a string';
    if (typeof profile.employmentStatus !== "string") return '"employmentStatus" must be a string';
    return null;
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/schemes
 * Query params:
 *   profileType  — "primary" | "family"   (required)
 *   memberId     — string                  (required when profileType=family)
 *
 * Returns eligible and rejected schemes with explainable reasons.
 */
export const listEligibleSchemes = async (req, res, next) => {
    try {
        const { profileType, memberId } = req.query;

        if (!profileType) {
            return res
                .status(400)
                .json(errorResponse('Query parameter "profileType" is required.'));
        }

        const { profile, error } = await resolveProfile(
            req.user.uid,
            profileType,
            memberId
        );

        if (error) {
            return res.status(404).json(errorResponse(error));
        }

        const { eligible, rejected } = await getEligibleSchemes(profile);

        return res.status(200).json(
            successResponse({ eligible, rejected })
        );
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/v1/schemes/eligible
 * Uses authenticated user's primaryProfile.
 * Returns eligible and rejected with reasons.
 */
export const listEligibleSchemesForPrimary = async (req, res, next) => {
    try {
        const userDoc = await getProfile(req.user.uid);

        if (!userDoc) {
            return res.status(404).json(errorResponse("User profile not found."));
        }

        if (!userDoc.primaryProfile) {
            return res.status(404).json(errorResponse("Primary profile not set."));
        }

        const { eligible, rejected } = await getEligibleSchemes(userDoc.primaryProfile);

        return res.status(200).json(
            successResponse({
                uid: req.user.uid,
                totalEligible: eligible.length,
                totalRejected: rejected.length,
                eligible,
                rejected,
            })
        );
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/v1/schemes/eligible
 *
 * Stateless, profile-agnostic eligibility check.
 * Accepts a profile object in the request body — does NOT touch Firestore user docs.
 * Authentication is still required.
 *
 * Request body:
 *  { "profile": { dateOfBirth, annualIncome, category, state,
 *                 gender, isStudent, employmentStatus, isDisabled, ... } }
 *
 * Response:
 *  { success: true, data: { eligible: [...], rejected: [{ ...scheme, reason }] } }
 */
export const checkEligibleSchemes = async (req, res, next) => {
    try {
        const { profile, filters } = req.body ?? {};

        const validationError = validateProfileBody(profile);
        if (validationError) {
            return res.status(400).json(errorResponse(validationError));
        }

        // Step 1: compute eligibility (single Firestore query)
        let { eligible, rejected } = await getPartitionedSchemes(profile);

        // Step 2: apply optional post-eligibility filters to both arrays
        if (filters && typeof filters === "object") {
            eligible = applyFilters(eligible, filters);
            rejected = applyFilters(rejected, filters);
        }

        return res.status(200).json(
            successResponse({ eligible, rejected })
        );
    } catch (err) {
        next(err);
    }
};
