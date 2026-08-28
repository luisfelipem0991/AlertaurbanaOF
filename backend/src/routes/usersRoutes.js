import { Router } from "express";
import { getUsers } from "../controllers/usersController.js";
import { allowRoles, verifyToken } from "../middleware/auth.js";

const router = Router();

router.get("/users", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), getUsers);

export default router;
