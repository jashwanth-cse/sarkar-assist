import db from "../config/firestore.js";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "users";

/**
 * Save (overwrite) the primaryProfile for a given uid.
 * Creates the document with defaults if it doesn't exist yet.
 * Always sets updatedAt; sets createdAt only on first creation.
 *
 * @param {string} uid
 * @param {object} profileData  — pre-validated, whitelisted fields from controller
 */
export const saveProfile = async (uid, profileData) => {
    const docRef = db.collection(COLLECTION).doc(uid);
    const doc = await docRef.get();

    if (doc.exists) {
        await docRef.update({
            primaryProfile: profileData,
            updatedAt: FieldValue.serverTimestamp(),
        });
    } else {
        await docRef.set({
            uid,
            primaryProfile: profileData,
            familyMembers: [],
            notificationOptIn: false,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
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
 * @param {object} member  — pre-validated, whitelisted object with auto-generated id
 */
export const addFamilyMember = async (uid, member) => {
    const docRef = db.collection(COLLECTION).doc(uid);
    const doc = await docRef.get();

    if (doc.exists) {
        await docRef.update({
            familyMembers: FieldValue.arrayUnion(member),
            updatedAt: FieldValue.serverTimestamp(),
        });
    } else {
        await docRef.set({
            uid,
            primaryProfile: null,
            familyMembers: [member],
            notificationOptIn: false,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });
    }
};

/**
 * Return the familyMembers array for a given uid.
 *
 * @param {string} uid
 * @returns {Array}
 */
export const getFamilyMembers = async (uid) => {
    const doc = await db.collection(COLLECTION).doc(uid).get();
    if (!doc.exists) return [];
    return doc.data().familyMembers ?? [];
};

/**
 * Remove a family member by their id field.
 * Fetches the document to find the exact object for arrayRemove.
 *
 * @param {string} uid
 * @param {string} memberId
 * @returns {boolean} true if found and removed
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
        updatedAt: FieldValue.serverTimestamp(),
    });

    return true;
};
