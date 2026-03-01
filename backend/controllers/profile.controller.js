import {
    saveProfile,
    getProfile,
    addFamilyMember,
    getFamilyMembers,
    deleteFamilyMember,
} from "../services/profile.service.js";
import {
    successResponse,
    errorResponse,
} from "../utils/responseFormatter.js";
import { isValidPastDate } from "../utils/dateUtils.js";
import { randomUUID } from "crypto";

// ─── Allowed enum values ──────────────────────────────────────────────────────

const GENDERS = ["Male", "Female", "Other"];
const CATEGORIES = ["SC", "ST", "OBC", "General"];
const EMPLOYMENT_STATUSES = ["Employed", "Unemployed", "Self-Employed"];

// ─── Primary profile validation ───────────────────────────────────────────────

/**
 * Validate and return a clean primaryProfile object, or return an error string.
 *
 * @param {object} body
 * @returns {{ data: object } | { error: string }}
 */
const parsePrimaryProfile = (body) => {
    const {
        name,
        dateOfBirth,
        gender,
        annualIncome,
        category,
        state,
        isStudent,
        employmentStatus,
        isDisabled,
        educationLevel = null,
        landOwnership = null,
    } = body;

    // Required string fields
    if (!name || typeof name !== "string")
        return { error: "Missing or invalid field: name (string required)" };

    if (!isValidPastDate(dateOfBirth))
        return { error: "Missing or invalid field: dateOfBirth (YYYY-MM-DD, must be in the past)" };

    if (!GENDERS.includes(gender))
        return { error: `Field "gender" must be one of: ${GENDERS.join(", ")}` };

    if (typeof annualIncome !== "number" || annualIncome < 0)
        return { error: "Field \"annualIncome\" must be a non-negative number" };

    if (!CATEGORIES.includes(category))
        return { error: `Field "category" must be one of: ${CATEGORIES.join(", ")}` };

    if (!state || typeof state !== "string")
        return { error: "Missing or invalid field: state (string required)" };

    if (typeof isStudent !== "boolean")
        return { error: "Field \"isStudent\" must be a boolean" };

    if (!EMPLOYMENT_STATUSES.includes(employmentStatus))
        return { error: `Field "employmentStatus" must be one of: ${EMPLOYMENT_STATUSES.join(", ")}` };

    if (typeof isDisabled !== "boolean")
        return { error: "Field \"isDisabled\" must be a boolean" };

    // Optional fields
    if (educationLevel !== null && typeof educationLevel !== "string")
        return { error: "Field \"educationLevel\" must be a string or null" };

    if (landOwnership !== null && typeof landOwnership !== "boolean")
        return { error: "Field \"landOwnership\" must be a boolean or null" };

    return {
        data: {
            name: name.trim(),
            dateOfBirth,
            gender,
            annualIncome,
            category,
            state: state.trim(),
            isStudent,
            employmentStatus,
            isDisabled,
            educationLevel,
            landOwnership,
        },
    };
};

// ─── Family member validation ─────────────────────────────────────────────────

/**
 * Validate and return a clean family member object, or return an error string.
 *
 * @param {object} body
 * @returns {{ data: object } | { error: string }}
 */
const parseFamilyMember = (body) => {
    const {
        name,
        dateOfBirth,
        gender,
        annualIncome,
        category,
        state,
        isStudent,
        employmentStatus,
        isDisabled,
    } = body;

    if (!name || typeof name !== "string")
        return { error: "Missing or invalid field: name (string required)" };

    if (!isValidPastDate(dateOfBirth))
        return { error: "Missing or invalid field: dateOfBirth (YYYY-MM-DD, must be in the past)" };

    if (!gender || typeof gender !== "string")
        return { error: "Missing or invalid field: gender (string required)" };

    if (typeof annualIncome !== "number" || annualIncome < 0)
        return { error: "Field \"annualIncome\" must be a non-negative number" };

    if (!category || typeof category !== "string")
        return { error: "Missing or invalid field: category (string required)" };

    if (!state || typeof state !== "string")
        return { error: "Missing or invalid field: state (string required)" };

    if (typeof isStudent !== "boolean")
        return { error: "Field \"isStudent\" must be a boolean" };

    if (!employmentStatus || typeof employmentStatus !== "string")
        return { error: "Missing or invalid field: employmentStatus (string required)" };

    if (typeof isDisabled !== "boolean")
        return { error: "Field \"isDisabled\" must be a boolean" };

    return {
        data: {
            name: name.trim(),
            dateOfBirth,
            gender,
            annualIncome,
            category,
            state: state.trim(),
            isStudent,
            employmentStatus,
            isDisabled,
        },
    };
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/profile
 * Save / overwrite primaryProfile for the authenticated user.
 */
export const createProfile = async (req, res, next) => {
    try {
        const result = parsePrimaryProfile(req.body);
        if (result.error) {
            return res.status(400).json(errorResponse(result.error));
        }

        await saveProfile(req.user.uid, result.data);

        return res.status(200).json(
            successResponse({
                message: "Profile saved successfully.",
                uid: req.user.uid,
            })
        );
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/v1/profile
 * Return stored profile for the authenticated user.
 */
export const fetchProfile = async (req, res, next) => {
    try {
        const profile = await getProfile(req.user.uid);

        if (!profile) {
            return res.status(404).json(errorResponse("Profile not found."));
        }

        return res.status(200).json(successResponse(profile));
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/v1/profile/family
 * Add a new family member for the authenticated user.
 */

export const addMember = async (req, res, next) => {
    try {
        const result = parseFamilyMember(req.body);
        if (result.error) {
            return res.status(400).json(errorResponse(result.error));
        }

        const member = { id: randomUUID(), ...result.data };
        await addFamilyMember(req.user.uid, member);

        return res.status(201).json(
            successResponse({ message: "Family member added.", member })
        );
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/v1/profile/family
 * Return the familyMembers array for the authenticated user.
 */
export const fetchFamily = async (req, res, next) => {
    try {
        const members = await getFamilyMembers(req.user.uid);
        return res.status(200).json(successResponse({ familyMembers: members }));
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/v1/profile/family/:memberId
 * Remove a family member by id.
 */
export const removeMember = async (req, res, next) => {
    try {
        const { memberId } = req.params;
        const removed = await deleteFamilyMember(req.user.uid, memberId);

        if (!removed) {
            return res
                .status(404)
                .json(errorResponse(`Family member "${memberId}" not found.`));
        }

        return res
            .status(200)
            .json(successResponse({ message: "Family member removed.", memberId }));
    } catch (err) {
        next(err);
    }
};
