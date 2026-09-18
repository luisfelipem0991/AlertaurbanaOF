import { Router } from "express";
import { createJac, getJacs, updateJac } from "../controllers/jacsController.js";
import { allowRoles, verifyToken } from "../middleware/auth.js";

const router = Router();

router.post("/jacs", verifyToken, allowRoles("ADMIN", "SUPERADMIN", "ALCALDIA"), createJac);
router.get("/jacs", verifyToken, allowRoles("ADMIN", "SUPERADMIN", "ALCALDIA", "JAC"), getJacs);
router.put("/jacs/:id", verifyToken, allowRoles("ADMIN", "SUPERADMIN", "ALCALDIA"), updateJac);

export default router;

