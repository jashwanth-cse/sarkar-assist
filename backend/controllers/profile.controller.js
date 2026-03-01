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
import { randomUUID } from "crypto";

// Required fields and their expected types
const REQUIRED_FIELDS = {
    age: "number",
    income: "number",
    category: "string",
    state: "string",
};

/**
 * Validate the profile payload.
 * @param {object} body
 * @returns {string|null} error message or null if valid
 */
const validateProfile = (body) => {
    for (const [field, type] of Object.entries(REQUIRED_FIELDS)) {
        if (body[field] === undefined || body[field] === null) {
            return `Missing required field: ${field}`;
        }
        // eslint-disable-next-line valid-typeof
        if (typeof body[field] !== type) {
            return `Field "${field}" must be a ${type}`;
        }
    }
    return null;
};

/**
 * POST /api/v1/profile
 * Save / overwrite primaryProfile for the authenticated user.
 */
export const createProfile = async (req, res, next) => {
    try {
        const validationError = validateProfile(req.body);
        if (validationError) {
            return res.status(400).json(errorResponse(validationError));
        }

        const { age, income, category, state } = req.body;
        const uid = req.user.uid;

        await saveProfile(uid, { age, income, category, state });

        return res.status(200).json(
            successResponse({
                message: "Profile saved successfully.",
                uid,
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
        const uid = req.user.uid;
        const profile = await getProfile(uid);

        if (!profile) {
            return res.status(404).json(errorResponse("Profile not found."));
        }

        return res.status(200).json(successResponse(profile));
    } catch (err) {
        next(err);
    }
};

// ─── Family member fields ─────────────────────────────────────────────────────

const FAMILY_REQUIRED_FIELDS = {
    name: "string",
    age: "number",
    income: "number",
    category: "string",
    state: "string",
};

const validateFamilyMember = (body) => {
    for (const [field, type] of Object.entries(FAMILY_REQUIRED_FIELDS)) {
        if (body[field] === undefined || body[field] === null) {
            return `Missing required field: ${field}`;
        }
        if (typeof body[field] !== type) {
            return `Field "${field}" must be a ${type}`;
        }
    }
    return null;
};

/**
 * POST /api/v1/profile/family
 * Add a new family member for the authenticated user.
 */
export const addMember = async (req, res, next) => {
    try {
        const validationError = validateFamilyMember(req.body);
        if (validationError) {
            return res.status(400).json(errorResponse(validationError));
        }

        const { name, age, income, category, state } = req.body;
        const member = {
            id: randomUUID(),
            name,
            age,
            income,
            category,
            state,
        };

        await addFamilyMember(req.user.uid, member);

        return res.status(201).json(
            successResponse({
                message: "Family member added.",
                member,
            })
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
