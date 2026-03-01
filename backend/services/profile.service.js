import db from "../config/firestore.js";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "users";

/**
 * Save (overwrite) the primaryProfile for a given uid.
 * Creates the document with defaults if it doesn't exist yet.
 *
 * @param {string} uid
 * @param {object} profileData
 */
export const saveProfile = async (uid, profileData) => {
    const docRef = db.collection(COLLECTION).doc(uid);
    const doc = await docRef.get();

    if (doc.exists) {
        // Overwrite only the primaryProfile field
        await docRef.update({ primaryProfile: profileData });
    } else {
        // First time — create full document structure
        await docRef.set({
            primaryProfile: profileData,
            familyMembers: [],
            createdAt: FieldValue.serverTimestamp(),
        });
    }
};

/**
 * Retrieve the full user document for a given uid.
 *
 * @param {string} uid
 * @returns {object|null} document data or null if not found
 */
export const getProfile = async (uid) => {
    const doc = await db.collection(COLLECTION).doc(uid).get();
    if (!doc.exists) return null;
    return doc.data();
};

/**
 * Add a new family member to the user's familyMembers array.
 * Creates the user document first if it doesn't exist.
 *
 * @param {string} uid
 * @param {object} member  - Must include id, name, age, income, category, state
 */
export const addFamilyMember = async (uid, member) => {
    const docRef = db.collection(COLLECTION).doc(uid);
    const doc = await docRef.get();

    if (doc.exists) {
        await docRef.update({
            familyMembers: FieldValue.arrayUnion(member),
        });
    } else {
        // Create document if it doesn't exist yet
        await docRef.set({
            primaryProfile: null,
            familyMembers: [member],
            createdAt: FieldValue.serverTimestamp(),
        });
    }
};

/**
 * Return the familyMembers array for a given uid.
 *
 * @param {string} uid
 * @returns {Array} array of family members (empty if doc not found)
 */
export const getFamilyMembers = async (uid) => {
    const doc = await db.collection(COLLECTION).doc(uid).get();
    if (!doc.exists) return [];
    return doc.data().familyMembers ?? [];
};

/**
 * Remove a family member by their id field.
 * Uses arrayRemove — requires the exact object match, so we fetch first.
 *
 * @param {string} uid
 * @param {string} memberId
 * @returns {boolean} true if member was found and removed, false otherwise
 */
export const deleteFamilyMember = async (uid, memberId) => {
    const docRef = db.collection(COLLECTION).doc(uid);
    const doc = await docRef.get();

    if (!doc.exists) return false;

    const members = doc.data().familyMembers ?? [];
    const target = members.find((m) => m.id === memberId);

    if (!target) return false;

    await docRef.update({
        familyMembers: FieldValue.arrayRemove(target),
    });

    return true;
};
