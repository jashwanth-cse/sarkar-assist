import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
    createProfile,
    fetchProfile,
    addMember,
    fetchFamily,
    removeMember,
} from "../controllers/profile.controller.js";

const router = Router();

// All profile routes require authentication
router.use(verifyToken);

// POST /api/v1/profile  — save / overwrite primaryProfile
router.post("/", createProfile);

// GET  /api/v1/profile  — retrieve stored profile
router.get("/", fetchProfile);

// POST   /api/v1/profile/family  — add a family member
router.post("/family", addMember);

// GET    /api/v1/profile/family  — list all family members
router.get("/family", fetchFamily);

// DELETE /api/v1/profile/family/:memberId  — remove a member by id
router.delete("/family/:memberId", removeMember);

export default router;
