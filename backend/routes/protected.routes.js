import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getProtected } from "../controllers/protected.controller.js";

const router = Router();

// GET /api/v1/protected — requires a valid Firebase ID token
router.get("/", verifyToken, getProtected);

export default router;
