/**
 * tests/testFcmPush.js
 *
 * End-to-end FCM test:
 *  1. Signs in via Firebase Auth REST API to get an ID token.
 *  2. Registers the provided FCM device token via POST /notifications/register-token.
 *  3. Sends a test push via POST /notifications/test-push.
 *
 * Usage:
 *   node tests/testFcmPush.js
 *
 * Requires: FIREBASE_WEB_API_KEY, TEST_EMAIL, TEST_PASSWORD in .env
 */

import "dotenv/config";

const { FIREBASE_WEB_API_KEY, TEST_EMAIL, TEST_PASSWORD } = process.env;
const BASE_URL = "http://localhost:5000/api/v1";
const FCM_TOKEN = "BCm4f1vr9CChGToJs-3kHusPRTsFiW087ojH8IHzfi9bU-ktMnIpzLJD8vAFza7eWQd2_Kghox5l5Z8zkMjANwI";

if (!FIREBASE_WEB_API_KEY || !TEST_EMAIL || !TEST_PASSWORD) {
    console.error("❌  Missing env vars. Set FIREBASE_WEB_API_KEY, TEST_EMAIL, TEST_PASSWORD in .env");
    process.exit(1);
}

// ── Step 1: Sign in ──────────────────────────────────────────────────────────
console.log(`\n🔐  Signing in as ${TEST_EMAIL} …`);

const authRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`,
    {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD, returnSecureToken: true }),
    }
);

const authData = await authRes.json();
if (!authRes.ok) {
    console.error("❌  Auth failed:", authData?.error?.message);
    process.exit(1);
}

const { idToken, localId } = authData;
console.log(`✅  Signed in. UID: ${localId}`);

const headers = { "Content-Type": "application/json", "Authorization": `Bearer ${idToken}` };

// ── Step 2: Register FCM token ───────────────────────────────────────────────
console.log(`\n📲  Registering FCM token …`);

const regRes = await fetch(`${BASE_URL}/notifications/register-token`, {
    method: "POST",
    headers,
    body: JSON.stringify({ token: FCM_TOKEN }),
});
const regData = await regRes.json();

console.log(`   Status : ${regRes.status}`);
console.log(`   Result : ${JSON.stringify(regData.data ?? regData)}`);

// ── Step 3: Test push ────────────────────────────────────────────────────────
console.log(`\n🚀  Sending test push notification …`);

const pushRes = await fetch(`${BASE_URL}/notifications/test-push`, {
    method: "POST",
    headers,
    body: JSON.stringify({ token: FCM_TOKEN }),
});
const pushData = await pushRes.json();

console.log(`   Status : ${pushRes.status}`);
console.log(`   Result : ${JSON.stringify(pushData)}`);

if (pushRes.ok) {
    console.log("\n✅  Test push sent successfully! Check your device for the notification.\n");
} else {
    console.log("\n❌  Test push failed.\n");
}
