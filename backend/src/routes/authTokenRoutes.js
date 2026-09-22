import { Router } from "express";
import { exchangeTicket, refreshSession, logoutSession } from "../controllers/authTokenController.js";

const router = Router();

// Canjear ticket temporal por access token + refresh cookie
router.post("/auth/exchange", exchangeTicket);

// Renovar access token usando el refresh token de la cookie HttpOnly
router.post("/auth/refresh", refreshSession);

// Cerrar sesión (invalidar refresh token)
router.post("/auth/logout", logoutSession);

export default router;

