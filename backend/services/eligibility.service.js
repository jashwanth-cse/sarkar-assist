/**
 * services/eligibility.service.js  — v3
 *
 * Responsibilities:
 *  1. Fetch all active schemes from Firestore "schemes" collection (one query, no loops).
 *  2. Evaluate every eligibilityRules field against the user profile.
 *  3. Apply semantic target-group guards after rule evaluation.
 *  4. Return explainable results — first failing reason is surfaced.
 *
 * Profile shape (from profile.controller.js):
 *  { name, dateOfBirth, gender, annualIncome, category, state,
 *    isStudent, employmentStatus, isDisabled, educationLevel, landOwnership }
 *
 * EligibilityRules shape (from schemes collection):
 *  { minAge, maxAge, incomeLimit, allowedCategories,
 *    gender, disabilityRequired, studentOnly, employmentStatus, state }
 *
 * checkEligibility() return shape:
 *  { isEligible: boolean, reason: string | null }
 *
 * getEligibleSchemes() return shape:
 *  { eligible: object[], rejected: object[] }
 */

import db from "../config/firestore.js";
import { calculateAge } from "../utils/dateUtils.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const SENIOR_CITIZEN_MIN_AGE = 60;
const SCHEMES_COLLECTION = "schemes";

// ─── Shared scheme summary builder ───────────────────────────────────────────

const buildSummary = (scheme) => ({
    id: scheme.id,
    schemeName: scheme.schemeName,
    ministry: scheme.ministry,
    schemeCategory: scheme.schemeCategory,
    level: scheme.level,
    state: scheme.state,
    description: scheme.description ?? null,
    tags: scheme.tags ?? [],
    deadline: scheme.deadline ?? null,
    applicationLink: scheme.applicationLink ?? null,
    applicationMode: scheme.applicationMode ?? null,
    benefits: scheme.benefits ?? null,
});

// ─── Target-group semantic guards ────────────────────────────────────────────

/**
 * Apply semantic guards based on scheme.schemeCategory and scheme.targetGroup.
 * These run AFTER eligibilityRules checks to prevent logically incorrect matches.
 * Returns the first failing reason, or null if all guards pass.
 *
 * @param {object} userProfile
 * @param {object} scheme        — full scheme document
 * @param {number} age           — pre-calculated age (avoid recalculating)
 * @returns {{ passed: boolean, reason: string | null }}
 */
const applyTargetGroupGuards = (userProfile, scheme, age) => {
    const targetGroup = Array.isArray(scheme.targetGroup) ? scheme.targetGroup : [];

    // Guard 1 — Pension category requires senior citizen age
    if (scheme.schemeCategory === "Pension" && age < SENIOR_CITIZEN_MIN_AGE) {
        return { passed: false, reason: "Scheme for senior citizens only" };
    }

    // Guard 2 — "Senior Citizens" target group requires senior citizen age
    if (targetGroup.includes("Senior Citizens") && age < SENIOR_CITIZEN_MIN_AGE) {
        return { passed: false, reason: "Scheme for senior citizens only" };
    }

    // Guard 3 — "Students" target group requires isStudent flag
    if (targetGroup.includes("Students") && !userProfile.isStudent) {
        return { passed: false, reason: "Student status required" };
    }

    // Guard 4 — "Farmers" target group requires land ownership
    if (targetGroup.includes("Farmers") && !userProfile.landOwnership) {
        return { passed: false, reason: "Scheme for farmers only" };
    }

    // Guard 5 — "Working Women" target group requires Female gender
    if (targetGroup.includes("Working Women") && userProfile.gender !== "Female") {
        return { passed: false, reason: "Gender restriction" };
    }

    return { passed: true, reason: null };
};
function isNearDeadline(deadlineDate) {
  const today = new Date();
  const deadline = new Date(deadlineDate);
  const diff = (deadline - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 7;
}
// ─── Core eligibility engine ──────────────────────────────────────────────────

/**
 * Evaluate a single scheme's eligibility rules against a user profile.
 * Returns the first failing reason for transparency.
 *
 * @param {object} userProfile
 * @param {object} scheme         — full scheme document from Firestore
 * @returns {{ isEligible: boolean, reason: string | null }}
 */
export const checkEligibility = (userProfile, scheme) => {
    const rules = scheme.eligibilityRules ?? {};
    const age = calculateAge(userProfile.dateOfBirth);

    // ── Phase 1: eligibilityRules checks ──────────────────────────────────────

    // Rule 1 — minimum age
    if (rules.minAge !== null && rules.minAge !== undefined) {
        if (age < rules.minAge)
            return { isEligible: false, reason: "Age below minimum requirement" };
    }

    // Rule 2 — maximum age
    if (rules.maxAge !== null && rules.maxAge !== undefined) {
        if (age > rules.maxAge)
            return { isEligible: false, reason: "Age exceeds maximum limit" };
    }

    // Rule 3 — income limit
    if (rules.incomeLimit !== null && rules.incomeLimit !== undefined) {
        if (userProfile.annualIncome > rules.incomeLimit)
            return { isEligible: false, reason: "Income exceeds scheme limit" };
    }

    // Rule 4 — allowed categories ("ALL" means any category passes)
    if (Array.isArray(rules.allowedCategories) && rules.allowedCategories.length > 0) {
        const allowsAll = rules.allowedCategories.includes("ALL");
        if (!allowsAll && !rules.allowedCategories.includes(userProfile.category))
            return { isEligible: false, reason: "Category not eligible" };
    }

    // Rule 5 — gender ("Any" means no restriction)
    if (rules.gender !== null && rules.gender !== undefined && rules.gender !== "Any") {
        if (userProfile.gender !== rules.gender)
            return { isEligible: false, reason: "Gender restriction" };
    }

    // Rule 6 — disability required
    if (rules.disabilityRequired === true) {
        if (!userProfile.isDisabled)
            return { isEligible: false, reason: "Disability required" };
    }

    // Rule 7 — student only
    if (rules.studentOnly === true) {
        if (!userProfile.isStudent)
            return { isEligible: false, reason: "Student status required" };
    }

    // Rule 8 — employment status ("Any" means no restriction)
    if (
        rules.employmentStatus !== null &&
        rules.employmentStatus !== undefined &&
        rules.employmentStatus !== "Any"
    ) {
        if (userProfile.employmentStatus !== rules.employmentStatus)
            return { isEligible: false, reason: "Employment status mismatch" };
    }

    // Rule 9 — state ("ALL" means any state passes)
    if (rules.state !== null && rules.state !== undefined && rules.state !== "ALL") {
        if (userProfile.state !== rules.state)
            return { isEligible: false, reason: "State restriction" };
    }

    // ── Phase 2: semantic target-group guards ─────────────────────────────────
    const guardResult = applyTargetGroupGuards(userProfile, scheme, age);
    if (!guardResult.passed) {
        return { isEligible: false, reason: guardResult.reason };
    }

    return { isEligible: true, reason: null };
};

// ─── Firestore fetch + partition ──────────────────────────────────────────────

/**
 * Fetch all active schemes from Firestore and partition into eligible / rejected.
 * Single Firestore query — all evaluation happens in memory.
 * Rejected entries include the reason they failed.
 *
 * @param {object} userProfile
 * @returns {Promise<{ eligible: object[], rejected: object[] }>}
 */
export const getEligibleSchemes = async (userProfile) => {
    const snapshot = await db
        .collection(SCHEMES_COLLECTION)
        .where("isActive", "==", true)
        .get();

    const eligible = [];
    const rejected = [];

    snapshot.forEach((doc) => {
        const scheme = { id: doc.id, ...doc.data() };
        const { isEligible, reason } = checkEligibility(userProfile, scheme);
        const summary = buildSummary(scheme);

        if (isEligible) {
            eligible.push(summary);
        } else {
            rejected.push({ ...summary, reason });
        }
    });

    return { eligible, rejected };
};

/**
 * Alias — getPartitionedSchemes is now identical to getEligibleSchemes.
 * Kept for backwards compatibility with existing controller imports.
 */
export const getPartitionedSchemes = getEligibleSchemes;
