import pool from "../config/db.js";

export async function getUsers(req, res) {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );

    return res.json(result.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getMe(req, res) {
  try {
    const result = await pool.query(
      "SELECT id, name, email, role, barrio, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export async function updateMe(req, res) {
  try {
    const { barrio } = req.body;
    const result = await pool.query(
      "UPDATE users SET barrio = $1 WHERE id = $2 RETURNING id, name, email, role, barrio",
      [barrio, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
