const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// 🔐 Load service account
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
db.settings({
  databaseId: "sarkar-assist"
});

// 📂 Load seed file
const seedPath = path.join(__dirname, "schemes.json");
const schemes = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

async function seedSchemes() {
  console.log("🚀 Starting scheme seeding...");

  const batch = db.batch();
  const collectionRef = db.collection("schemes");

  schemes.forEach((scheme) => {
    const docRef = collectionRef.doc(scheme.id);

    batch.set(
      docRef,
      {
        ...scheme,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true } // 🔥 prevents overwrite & duplicates
    );
  });

  await batch.commit();

  console.log(`✅ Successfully seeded ${schemes.length} schemes`);
  process.exit();
}

seedSchemes().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});