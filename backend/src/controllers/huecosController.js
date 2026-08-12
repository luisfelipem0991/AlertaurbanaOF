import pool from "../config/db.js";
import { validateHuecoPayload } from "../utils/validators.js";

// POST /api/huecos — crea un reporte. Requiere estar autenticado (verifyToken).
export async function createHueco(req, res) {
  try {
    const { valid, errors } = validateHuecoPayload(req.body);

    if (!valid) {
      return res.status(400).json({ error: errors[0] });
    }

    const { direccion, descripcion, imagen_url } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `INSERT INTO huecos (user_id, direccion, descripcion, imagen_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, direccion, descripcion, imagen_url, estado, prioridad, created_at`,
      [userId, direccion.trim(), descripcion.trim(), imagen_url.trim()]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE HUECO ERROR:");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({ error: "Error del servidor" });
  }
}

// GET /api/huecos — lista pública de reportes, del más reciente al más antiguo.
export async function getHuecos(req, res) {
  try {
    const result = await pool.query(
      `SELECT h.id, h.direccion, h.descripcion, h.imagen_url, h.estado,
              h.prioridad, h.created_at, u.name AS reportado_por
       FROM huecos h
       JOIN users u ON u.id = h.user_id
       ORDER BY h.created_at DESC`
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("GET HUECOS ERROR:");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({ error: "Error del servidor" });
  }
}
