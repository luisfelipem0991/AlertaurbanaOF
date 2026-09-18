import { Router } from "express";
import { startGoogleAuth, googleAuthCallback } from "../controllers/googleAuthController.js";

const router = Router();

router.get("/auth/google", startGoogleAuth);
router.get("/auth/google/callback", googleAuthCallback);

export default router;

