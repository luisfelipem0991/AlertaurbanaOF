import { Router } from "express";
import {
  sendResetCode,
  verifyResetCode,
  resetPassword,
} from "../controllers/forgotPasswordController.js";

const router = Router();

// Paso 1: recibe el correo y, si existe, envía un código de recuperación
router.post("/forgot-password/send-code", sendResetCode);

// Paso 2: valida el código y entrega un token temporal para cambiar la contraseña
router.post("/forgot-password/verify-code", verifyResetCode);

// Paso 3: recibe el token temporal y la nueva contraseña, y la actualiza
router.post("/forgot-password/reset", resetPassword);

export default router;