import { Router } from "express";
import { getUsers, getMe, updateMe } from "../controllers/usersController.js";
import { allowRoles, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/users/me", verifyToken, getMe);
router.patch("/users/me", verifyToken, updateMe);
router.get("/users", verifyToken, allowRoles("ADMIN", "SUPERADMIN", "ALCALDIA"), getUsers);

export default router;
