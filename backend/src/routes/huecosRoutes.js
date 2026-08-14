import { Router } from "express";
import { createHueco, getHuecos } from "../controllers/huecosController.js";
import { verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/huecos", getHuecos);
router.post("/huecos", verifyToken, createHueco);

export default router;
