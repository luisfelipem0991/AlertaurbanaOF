import pool from "../config/db.js";

export async function deleteUserById(req, res) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json({ message: "Usuario eliminado" });
  } catch (error) {
    return res.status(500).json({ error: "Error del servidor" });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["USER", "JAC", "ALCALDIA"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Rol no permitido. Debe ser USER, JAC o ALCALDIA." });
    }

    if (req.user.role === "ALCALDIA" && !["USER", "JAC"].includes(role)) {
      return res.status(403).json({ error: "Como Alcaldía solo puedes asignar los roles USER y JAC." });
    }

    if (req.user.role === "ALCALDIA") {
      const userToModify = await pool.query("SELECT role FROM users WHERE id = $1", [id]);
      if (userToModify.rows.length === 0) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      const currentRole = userToModify.rows[0].role;
      if (["ADMIN", "SUPERADMIN", "ALCALDIA"].includes(currentRole)) {
        return res.status(403).json({ error: "No tienes permiso para modificar a este usuario." });
      }
    }

    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role",
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar el rol:", error);
    return res.status(500).json({ error: "Error del servidor al actualizar el rol" });
  }
}
