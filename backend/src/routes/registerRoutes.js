import { Router } from "express";
import { sendCode, verifyCode } from "../controllers/registerController.js";

const router = Router();

// Paso 1: recibe los datos del formulario, genera el código y lo manda por correo
router.post("/register/send-code", sendCode);

// Paso 2: recibe el código de 4 dígitos y, si es correcto, crea el usuario
router.post("/register/verify-code", verifyCode);

export default router;
