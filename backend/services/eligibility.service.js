/**
 * services/eligibility.service.js
 *
 * Pure eligibility engine — no database, no Express dependency.
 * All functions are stateless and side-effect free.
 */

/**
 * Evaluate whether a user profile meets a scheme's eligibility criteria.
 *
 * @param {{ age: number, income: number, category: string, state: string }} profile
 * @param {{
 *   minAge?: number,
 *   maxAge?: number,
 *   incomeLimit?: number,
 *   allowedCategories?: string[],
 *   state?: string
 * }} scheme
 * @returns {{ eligible: boolean, reasons: string[] }}
 */
export const checkEligibility = (profile, scheme) => {
    const reasons = [];

    // Rule 1 — minimum age
    if (scheme.minAge !== undefined && profile.age < scheme.minAge) {
        reasons.push(
            `Age ${profile.age} is below the minimum required age of ${scheme.minAge}.`
        );
    }

    // Rule 2 — maximum age
    if (scheme.maxAge !== undefined && profile.age > scheme.maxAge) {
        reasons.push(
            `Age ${profile.age} exceeds the maximum allowed age of ${scheme.maxAge}.`
        );
    }

    // Rule 3 — income limit
    if (scheme.incomeLimit !== undefined && profile.income > scheme.incomeLimit) {
        reasons.push(
            `Income ${profile.income} exceeds the allowed limit of ${scheme.incomeLimit}.`
        );
    }

    // Rule 4 — allowed categories
    if (
        Array.isArray(scheme.allowedCategories) &&
        scheme.allowedCategories.length > 0 &&
        !scheme.allowedCategories.includes(profile.category)
    ) {
        reasons.push(
            `Category "${profile.category}" is not in the allowed categories: [${scheme.allowedCategories.join(", ")}].`
        );
    }

    // Rule 5 — state restriction (skip if "ALL")
    if (
        scheme.state !== undefined &&
        scheme.state !== "ALL" &&
        profile.state !== scheme.state
    ) {
        reasons.push(
            `State "${profile.state}" does not match the required state "${scheme.state}".`
        );
    }

    return {
        eligible: reasons.length === 0,
        reasons,
    };
};
