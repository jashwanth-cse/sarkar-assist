/**
 * tests/getToken.js
 *
 * Obtains a Firebase ID token by signing in via the Firebase Auth REST API.
 * Node.js 18+ built-in fetch is used — no extra dependencies required.
 *
 * Usage:
 *   node tests/getToken.js
 *
 * Required env vars (add to backend/.env):
 *   FIREBASE_WEB_API_KEY=<your-firebase-web-api-key>
 *   TEST_EMAIL=<test-user-email>
 *   TEST_PASSWORD=<test-user-password>
 *
 * The script will:
 *   1. Sign in the test user and retrieve an idToken.
 *   2. Print a ready-to-use curl / PowerShell command to test /api/v1/protected.
 */

import "dotenv/config";

const { FIREBASE_WEB_API_KEY, TEST_EMAIL, TEST_PASSWORD } = process.env;

if (!FIREBASE_WEB_API_KEY || !TEST_EMAIL || !TEST_PASSWORD) {
    console.error(
        "❌  Missing env vars. Set FIREBASE_WEB_API_KEY, TEST_EMAIL, TEST_PASSWORD in .env"
    );
    process.exit(1);
}

const SIGN_IN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_WEB_API_KEY}`;

async function getToken() {
    console.log(`🔐  Signing in as ${TEST_EMAIL} …`);

    const res = await fetch(SIGN_IN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            returnSecureToken: true,
        }),
    });

    const body = await res.json();

    if (!res.ok) {
        console.error("❌  Firebase sign-in failed:", body?.error?.message);
        process.exit(1);
    }

    const { idToken, localId, expiresIn } = body;

    console.log("\n✅  Token obtained successfully!");
    console.log(`   UID        : ${localId}`);
    console.log(`   Expires in : ${expiresIn}s (~1 hour)\n`);
    console.log("─".repeat(70));
    console.log("📋  Your ID token:\n");
    console.log(idToken);
    console.log("\n" + "─".repeat(70));
    console.log("\n🧪  Test the protected route:\n");
    console.log(
        `   PowerShell:\n   Invoke-RestMethod -Uri http://localhost:5000/api/v1/protected \\\n     -Headers @{ Authorization = "Bearer ${idToken}" }\n`
    );
    console.log(
        `   curl:\n   curl -H "Authorization: Bearer ${idToken}" http://localhost:5000/api/v1/protected\n`
    );
}

getToken().catch((err) => {
    console.error("❌  Unexpected error:", err.message);
    process.exit(1);
});
