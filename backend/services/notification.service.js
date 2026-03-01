import db from "../config/firestore.js";

const COLLECTION = "users";
const MAX_FCM_TOKENS = 5;

/**
 * Register an FCM WebPush token for a user.
 *
 * Rules:
 *  - No duplicates (token already present → no-op).
 *  - Max 5 tokens per user — oldest entry is evicted when limit is reached.
 *  - Creates the user document if it doesn't exist yet.
 *
 * @param {string} uid
 * @param {string} token  — FCM registration token
 * @returns {"added"|"exists"|"evicted"} outcome
 */
export const registerFcmToken = async (uid, token) => {
    const docRef = db.collection(COLLECTION).doc(uid);
    const doc = await docRef.get();

    const existing = doc.exists ? (doc.data().fcmTokens ?? []) : [];

    // No-op if token already registered
    if (existing.includes(token)) {
        return "exists";
    }

    let updatedTokens;
    let outcome;

    if (existing.length >= MAX_FCM_TOKENS) {
        // Evict the oldest token (index 0) and append the new one
        updatedTokens = [...existing.slice(1), token];
        outcome = "evicted";
    } else {
        updatedTokens = [...existing, token];
        outcome = "added";
    }

    if (doc.exists) {
        await docRef.update({ fcmTokens: updatedTokens });
    } else {
        await docRef.set({
            fcmTokens: updatedTokens,
            createdAt: new Date(),
        });
    }

    return outcome;
};
