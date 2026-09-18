import { Router } from "express";
import { getUsers, getMe, updateMe, requestBarrioChange, verifyBarrioChange } from "../controllers/usersController.js";
import { allowRoles, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/users/me", verifyToken, getMe);
router.patch("/users/me", verifyToken, updateMe);
router.post("/users/me/request-barrio-change", verifyToken, requestBarrioChange);
router.post("/users/me/verify-barrio-change", verifyToken, verifyBarrioChange);
router.get("/users", verifyToken, allowRoles("ADMIN", "SUPERADMIN", "ALCALDIA"), getUsers);

export default router;
