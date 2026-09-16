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
      "SELECT id, name, email, role, barrio, jac_id, created_at FROM users WHERE id = $1",
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
    const { barrio, jac_id } = req.body;
    
    let query = "UPDATE users SET ";
    let values = [];
    let setClauses = [];

    if (barrio !== undefined) {
      setClauses.push(`barrio = $${values.length + 1}`);
      values.push(barrio);
    }
    if (jac_id !== undefined) {
      setClauses.push(`jac_id = $${values.length + 1}`);
      values.push(jac_id);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: "Nada que actualizar" });
    }

    query += setClauses.join(", ");
    query += ` WHERE id = $${values.length + 1} RETURNING id, name, email, role, barrio, jac_id`;
    values.push(req.user.id);

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json(result.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

import crypto from "crypto";
import { sendBarrioChangeCodeEmail } from "../utils/mailer.js";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function generateCode() {
  return String(crypto.randomInt(0, 10000)).padStart(4, "0");
}

export async function requestBarrioChange(req, res) {
  try {
    const { barrio } = req.body;
    if (!barrio || barrio.trim() === "") return res.status(400).json({ error: "Barrio no válido" });
    
    // Get user email
    const userResult = await pool.query("SELECT email FROM users WHERE id = $1", [req.user.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    const email = userResult.rows[0].email;

    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    // Save code to user row
    await pool.query(
      "UPDATE users SET pending_barrio = $1, barrio_code = $2, barrio_code_expires_at = $3, barrio_code_attempts = 0 WHERE id = $4",
      [barrio.trim(), code, expiresAt, req.user.id]
    );

    // Send email
    await sendBarrioChangeCodeEmail(email, code, barrio.trim());

    return res.json({ message: "Código enviado" });
  } catch (error) {
    console.error("REQUEST BARRIO ERROR:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
}

export async function verifyBarrioChange(req, res) {
  try {
    const { code } = req.body;
    
    const userResult = await pool.query(
      "SELECT pending_barrio, barrio_code, barrio_code_expires_at, barrio_code_attempts FROM users WHERE id = $1",
      [req.user.id]
    );
    if (userResult.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    const user = userResult.rows[0];

    if (!user.barrio_code || !user.pending_barrio) {
      return res.status(400).json({ error: "No hay ningún cambio de barrio pendiente" });
    }

    if (new Date(user.barrio_code_expires_at) < new Date()) {
      await pool.query("UPDATE users SET pending_barrio = NULL, barrio_code = NULL WHERE id = $1", [req.user.id]);
      return res.status(400).json({ error: "El código expiró. Solicita uno nuevo." });
    }

    if (user.barrio_code_attempts >= MAX_ATTEMPTS) {
      await pool.query("UPDATE users SET pending_barrio = NULL, barrio_code = NULL WHERE id = $1", [req.user.id]);
      return res.status(400).json({ error: "Demasiados intentos. Solicita un nuevo código." });
    }

    if (user.barrio_code !== code.trim()) {
      await pool.query("UPDATE users SET barrio_code_attempts = barrio_code_attempts + 1 WHERE id = $1", [req.user.id]);
      return res.status(400).json({ error: "Código incorrecto" });
    }

    // Success! Apply the barrio
    const finalResult = await pool.query(
      "UPDATE users SET barrio = pending_barrio, pending_barrio = NULL, barrio_code = NULL, barrio_code_attempts = 0 WHERE id = $1 RETURNING id, name, email, role, barrio",
      [req.user.id]
    );

    return res.json(finalResult.rows[0]);
  } catch (error) {
    console.error("VERIFY BARRIO ERROR:", error);
    return res.status(500).json({ error: "Error del servidor" });
  }
}
