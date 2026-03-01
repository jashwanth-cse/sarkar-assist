import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import {
    listEligibleSchemes,
    listEligibleSchemesForPrimary,
    checkEligibleSchemes,
} from "../controllers/scheme.controller.js";

const router = Router();

// All scheme routes require authentication
router.use(verifyToken);

// GET  /api/v1/schemes?profileType=primary
// GET  /api/v1/schemes?profileType=family&memberId=<id>
router.get("/", listEligibleSchemes);

// GET  /api/v1/schemes/eligible  — legacy: uses authenticated user's primaryProfile
router.get("/eligible", listEligibleSchemesForPrimary);

// POST /api/v1/schemes/eligible  — stateless: profile passed in request body
router.post("/eligible", checkEligibleSchemes);

export default router;
