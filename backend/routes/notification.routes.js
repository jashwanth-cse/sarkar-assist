import { Router } from "express";
import admin from "firebase-admin";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { registerToken } from "../controllers/notification.controller.js";

const router = Router();

// 🔒 Protect all notification routes
router.use(verifyToken);

// 🧪 Temporary Manual Push Test Route
router.post("/test-push", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token required" });
    }

    await admin.messaging().send({
      token,
      notification: {
        title: "Manual Test Notification",
        body: "If you see this, FCM backend works."
      }
    });

    res.json({ success: true, message: "Notification sent" });

  } catch (err) {
    console.error("Push error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Register token route
router.post("/register-token", registerToken);

export default router;