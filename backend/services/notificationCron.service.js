/**
 * services/notificationCron.service.js  — v3
 *
 * Daily cron at 9:00 AM IST.
 *
 * Responsibilities:
 *  - Fetch active schemes near deadline (≤ 7 days).
 *  - For each user: collect eligible profile names, send ONE consolidated FCM notification.
 *  - Deduplicate via user.deadlineNotifications[schemeId] map.
 *  - Auto-initialize missing deadlineNotifications field (no manual Firestore ops needed).
 *  - Log Firestore index URLs if composite index is missing (FAILED_PRECONDITION).
 *  - Never crash — all errors caught and logged per user/token.
 *
 * Modular helpers:
 *  - ensureDeadlineNotificationField(uid, userData)
 *  - hasAlreadyNotified(userData, schemeId)
 *  - markAsNotified(uid, schemeId)
 *  - sendNotification(tokens, title, body, data)
 */

import cron from "node-cron";
import admin from "../config/firebaseAdmin.js";
import db from "../config/firestore.js";
import { FieldValue } from "firebase-admin/firestore";
import { checkEligibility } from "./eligibility.service.js";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEADLINE_WARN_DAYS = 7;
const SCHEMES_COLLECTION = "schemes";
const USERS_COLLECTION = "users";

// ─── Helpers: date ────────────────────────────────────────────────────────────

const daysUntilDeadline = (deadline) => {
    if (!deadline) return Infinity;
    const ms = new Date(deadline).getTime() - Date.now();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

// ─── Helpers: Firestore field management ─────────────────────────────────────

/**
 * Ensure user.deadlineNotifications exists in Firestore.
 * If missing: initializes it to {} in Firestore (merge) and returns {}.
 * If present: returns current value as-is.
 *
 * @param {string} uid
 * @param {object} userData  — already-fetched user document data
 * @returns {object} the deadlineNotifications map
 */
const ensureDeadlineNotificationField = async (uid, userData) => {
    if (userData.deadlineNotifications && typeof userData.deadlineNotifications === "object") {
        return userData.deadlineNotifications;
    }

    // Field missing — initialize in Firestore without overwriting other fields
    await db.collection(USERS_COLLECTION).doc(uid).set(
        { deadlineNotifications: {} },
        { merge: true }
    );

    console.log(`[NotificationCron] Initialized deadlineNotifications for uid=${uid}`);
    return {};
};

/**
 * Check whether this user has already been notified for a specific scheme.
 *
 * @param {object} userData
 * @param {string} schemeId
 * @returns {boolean}
 */
const hasAlreadyNotified = (deadlineNotifications, schemeId) => {
    return Boolean(deadlineNotifications[schemeId]);
};

/**
 * Record that the user has been notified for a scheme.
 * Uses dot-notation update to avoid overwriting sibling keys.
 *
 * @param {string} uid
 * @param {string} schemeId
 */
const markAsNotified = async (uid, schemeId) => {
    await db.collection(USERS_COLLECTION).doc(uid).update({
        [`deadlineNotifications.${schemeId}`]: FieldValue.serverTimestamp(),
    });
};

// ─── Helpers: FCM ────────────────────────────────────────────────────────────

/**
 * Send an FCM notification to a list of device tokens.
 *
 * @param {string[]} tokens
 * @param {string}   title
 * @param {string}   body
 * @param {object}   data    — string key-value pairs for data payload
 * @returns {number} number of tokens that received successfully
 */
const sendNotification = async (tokens, title, body, data = {}) => {
    const message = {
        tokens,
        notification: { title, body },
        data: Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
        ),
        android: { priority: "high" },
        apns: { payload: { aps: { badge: 1 } } },
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return response.responses.filter((r) => r.success).length;
};

// ─── Core job ─────────────────────────────────────────────────────────────────

export const runDeadlineNotificationJob = async () => {
    console.log(`[NotificationCron] ▶ Running at ${new Date().toISOString()}`);

    // ── Step 1: Fetch near-deadline schemes ───────────────────────────────────

    let nearDeadlineSchemes = [];

    try {
        const schemesSnap = await db
            .collection(SCHEMES_COLLECTION)
            .where("isActive", "==", true)
            .where("deadline", "!=", null)
            .get();

        schemesSnap.forEach((doc) => {
            const scheme = { id: doc.id, ...doc.data() };
            const days = daysUntilDeadline(scheme.deadline);
            if (days >= 0 && days <= DEADLINE_WARN_DAYS) {
                nearDeadlineSchemes.push({ ...scheme, daysLeft: days });
            }
        });
    } catch (err) {
        // Firestore composite index missing → log the index creation URL and exit gracefully
        if (err.code === 9 || err.message?.includes("FAILED_PRECONDITION")) {
            const indexUrl = err.message?.match(/https:\/\/console\.firebase\.google\.com[^\s]*/)?.[0];
            console.error("[NotificationCron] ❌ Composite index required for deadline query.");
            if (indexUrl) {
                console.error("[NotificationCron] 🔗 Create index here:", indexUrl);
            } else {
                console.error(
                    "[NotificationCron] Create a composite index on 'schemes':\n" +
                    "  Field 1: isActive (Ascending)\n" +
                    "  Field 2: deadline (Ascending)\n" +
                    "  https://console.firebase.google.com/project/_/firestore/indexes"
                );
            }
        } else {
            console.error("[NotificationCron] ❌ Failed to fetch schemes:", err.message);
        }
        return; // Exit gracefully — do not crash
    }

    if (nearDeadlineSchemes.length === 0) {
        console.log("[NotificationCron] No schemes near deadline — nothing to send.");
        return;
    }
    console.log(`[NotificationCron] ${nearDeadlineSchemes.length} scheme(s) near deadline.`);

    // ── Step 2: Fetch users (selective fields only) ───────────────────────────

    // Firestore doesn't support field-level projections in Admin SDK,
    // but we only access the fields we need — no extra computation on others.
    const usersSnap = await db.collection(USERS_COLLECTION).get();

    let totalNotified = 0;
    let totalSkipped = 0;

    // ── Step 3: Process each user in parallel ────────────────────────────────

    const userJobs = usersSnap.docs.map(async (userDoc) => {
        const uid = userDoc.id;
        const data = userDoc.data();

        // Guard: skip users with no registered FCM tokens
        const tokens = data.fcmTokens ?? [];
        if (tokens.length === 0) {
            totalSkipped++;
            return;
        }

        // Auto-initialize missing deadlineNotifications
        const deadlineNotifications = await ensureDeadlineNotificationField(uid, data);

        for (const scheme of nearDeadlineSchemes) {
            // Dedup: already notified for this scheme — skip
            if (hasAlreadyNotified(deadlineNotifications, scheme.id)) continue;

            // Collect eligible profile names
            const eligibleNames = [];

            if (data.primaryProfile) {
                const { isEligible } = checkEligibility(data.primaryProfile, scheme);
                if (isEligible) eligibleNames.push("You");
            }

            for (const member of data.familyMembers ?? []) {
                const { isEligible } = checkEligibility(member, scheme);
                if (isEligible) eligibleNames.push(member.name ?? `Member ${member.id?.slice(0, 6)}`);
            }

            if (eligibleNames.length === 0) continue;

            // Send ONE consolidated notification
            try {
                const title = "Scheme Deadline Approaching";
                const body = `${scheme.schemeName} deadline is near. Eligible for: ${eligibleNames.join(", ")}`;
                const data = {
                    schemeId: scheme.id,
                    schemeName: scheme.schemeName,
                    deadline: scheme.deadline ?? "",
                    daysLeft: scheme.daysLeft,
                    eligibleFor: eligibleNames.join(", "),
                    type: "DEADLINE_REMINDER",
                };

                const successCount = await sendNotification(tokens, title, body, data);

                if (successCount > 0) {
                    await markAsNotified(uid, scheme.id);
                    totalNotified++;
                    console.log(
                        `[NotificationCron] ✅ uid=${uid} | scheme=${scheme.id} | ` +
                        `eligible=[${eligibleNames.join(", ")}] | ` +
                        `tokens=${successCount}/${tokens.length}`
                    );
                }
            } catch (fcmErr) {
                console.error(
                    `[NotificationCron] ❌ FCM error uid=${uid} scheme=${scheme.id}:`,
                    fcmErr.message
                );
            }
        }
    });

    await Promise.allSettled(userJobs);

    console.log(
        `[NotificationCron] ✅ Done. Notified: ${totalNotified} | ` +
        `Skipped (no tokens): ${totalSkipped} | ` +
        `Total users: ${usersSnap.size}`
    );
};

// ─── Cron schedule ────────────────────────────────────────────────────────────

export const startNotificationCron = () => {
    cron.schedule("0 9 * * *", runDeadlineNotificationJob, {
        timezone: "Asia/Kolkata",
    });
    console.log("⏰  Notification cron scheduled — runs daily at 09:00 IST.");
};
