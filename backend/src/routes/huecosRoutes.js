import { Router } from "express";
import { createHueco, getHuecos, updateHueco } from "../controllers/huecosController.js";
import { allowRoles, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/huecos", getHuecos);
router.post("/huecos", verifyToken, allowRoles("USER"), createHueco);
router.patch("/huecos/:id", verifyToken, allowRoles("JAC", "ALCALDIA", "ADMIN", "SUPERADMIN"), updateHueco);

export default router;
