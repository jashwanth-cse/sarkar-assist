import { getEligibleSchemes } from "./eligibility.service.js";
import { getProfile } from "./profile.service.js";

// ─── Profile resolver ─────────────────────────────────────────────────────────

/**
 * Load and return the correct profile sub-object from Firestore.
 *
 * @param {string}              uid
 * @param {"primary"|"family"}  profileType
 * @param {string|undefined}    memberId  — required when profileType === "family"
 * @returns {{ profile: object|null, error: string|null }}
 */
export const resolveProfile = async (uid, profileType, memberId) => {
    const userDoc = await getProfile(uid);

    if (!userDoc) {
        return { profile: null, error: "User profile not found." };
    }

    if (profileType === "primary") {
        if (!userDoc.primaryProfile) {
            return { profile: null, error: "Primary profile not set." };
        }
        return { profile: userDoc.primaryProfile, error: null };
    }

    if (profileType === "family") {
        if (!memberId) {
            return {
                profile: null,
                error: "memberId query parameter is required for profileType=family.",
            };
        }
        const member = (userDoc.familyMembers ?? []).find((m) => m.id === memberId);
        if (!member) {
            return { profile: null, error: `Family member "${memberId}" not found.` };
        }
        return { profile: member, error: null };
    }

    return {
        profile: null,
        error: 'profileType must be "primary" or "family".',
    };
};

export { getEligibleSchemes };