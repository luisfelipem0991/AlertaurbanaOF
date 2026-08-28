import { Router } from "express";
import { createHueco, getHuecos } from "../controllers/huecosController.js";
import { allowRoles, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/huecos", getHuecos);
router.post("/huecos", verifyToken, allowRoles("USER"), createHueco);

export default router;
