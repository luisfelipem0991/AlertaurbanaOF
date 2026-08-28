import { Router } from "express";
import { deleteUserById } from "../controllers/userByIdController.js";
import { allowRoles, verifyToken } from "../middleware/auth.js";

const router = Router();

router.delete("/users/:id", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), deleteUserById);

export default router;
