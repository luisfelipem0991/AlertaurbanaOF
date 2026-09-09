import { Router } from "express";
import { deleteUserById, updateUserRole } from "../controllers/userByIdController.js";
import { allowRoles, verifyToken } from "../middleware/auth.js";

const router = Router();

router.delete("/users/:id", verifyToken, allowRoles("ADMIN", "SUPERADMIN"), deleteUserById);
router.patch("/users/:id/role", verifyToken, allowRoles("ADMIN", "SUPERADMIN", "ALCALDIA"), updateUserRole);

export default router;
