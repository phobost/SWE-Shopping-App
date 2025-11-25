// One-time script to set a user as admin
const admin = require("firebase-admin");

// Initialize the admin SDK
admin.initializeApp({
  projectId: "swe-cs3773-g2-da56b",
});

// Replace with your email address
const EMAIL_TO_MAKE_ADMIN = "ds@swe.com";

async function setAdmin() {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(EMAIL_TO_MAKE_ADMIN);

    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, { role: "admin" });

    console.log(`✅ Successfully set ${EMAIL_TO_MAKE_ADMIN} as admin`);
    console.log(
      "⚠️  User must sign out and sign back in for changes to take effect",
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

setAdmin();
