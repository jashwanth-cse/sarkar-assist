import admin from "firebase-admin";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// ESM-safe way to resolve __dirname
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the service account key JSON using createRequire (import.meta.url based)
const require = createRequire(import.meta.url);
const serviceAccount = require(join(__dirname, "../serviceAccountKey.json"));

// Initialise only once (guard against hot-reload double-init)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export default admin;
