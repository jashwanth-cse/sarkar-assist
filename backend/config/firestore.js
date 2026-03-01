import { getFirestore } from "firebase-admin/firestore";
import admin from "./firebaseAdmin.js";

/**
 * Firestore client pointed at the "sarkar-assist" named database.
 * Import `db` wherever Firestore access is needed.
 */
const db = getFirestore(admin.app(), "sarkar-assist");

export default db;
