import crypto from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import {
  validateForgotPasswordPayload,
  validateResetVerifyCodePayload,
  validateResetPasswordPayload,
} from "../utils/validators.js";
import { sendPasswordResetCodeEmail } from "../utils/mailer.js";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESET_TOKEN_TTL = "10m";
const GENERIC_MESSAGE = "Si el correo está registrado, se envió un código a esa dirección";

function generateCode() {
  // Código de 4 dígitos, incluye ceros a la izquierda (ej: "0043")
  return String(crypto.randomInt(0, 10000)).padStart(4, "0");
}

// PASO 1: si el correo existe, genera un código de 4 dígitos y lo envía.
// Responde siempre el mismo mensaje genérico para no revelar si el correo existe (evita enumeración de usuarios).
export async function sendResetCode(req, res) {
  try {
    const { valid, errors } = validateForgotPasswordPayload(req.body);

    if (!valid) {
      return res.status(400).json({ error: errors[0] });
    }

    const email = req.body.email.trim().toLowerCase();

    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length > 0) {
      const code = generateCode();
      const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

      await pool.query(
        `INSERT INTO password_resets (email, code, attempts, expires_at)
         VALUES ($1, $2, 0, $3)
         ON CONFLICT (email) DO UPDATE SET
           code = EXCLUDED.code,
           attempts = 0,
           expires_at = EXCLUDED.expires_at,
           created_at = NOW()`,
        [email, code, expiresAt]
      );

      await sendPasswordResetCodeEmail(email, code);
    }

    // Mismo mensaje exista o no el usuario.
    return res.json({ message: GENERIC_MESSAGE });
  } catch (error) {
    console.error("SEND RESET CODE ERROR:");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({ error: "Error del servidor" });
  }
}

// PASO 2: valida el código de 4 dígitos y, si es correcto, entrega un token
// de corta duración que autoriza el cambio de contraseña (sin cambiarla todavía).
export async function verifyResetCode(req, res) {
  try {
    const { valid, errors } = validateResetVerifyCodePayload(req.body);

    if (!valid) {
      return res.status(400).json({ error: errors[0] });
    }

    const email = req.body.email.trim().toLowerCase();
    const code = req.body.code.trim();

    const result = await pool.query(
      "SELECT * FROM password_resets WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "No hay una solicitud de recuperación para este correo" });
    }

    const pending = result.rows[0];

    if (new Date(pending.expires_at) < new Date()) {
      await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);
      return res.status(400).json({ error: "El código expiró, solicita uno nuevo" });
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);
      return res.status(400).json({ error: "Demasiados intentos, solicita un nuevo código" });
    }

    if (pending.code !== code) {
      await pool.query(
        "UPDATE password_resets SET attempts = attempts + 1 WHERE email = $1",
        [email]
      );
      return res.status(400).json({ error: "Código incorrecto" });
    }

    // Código correcto: emite un token de un solo propósito para autorizar el cambio.
    const resetToken = jwt.sign(
      { email, purpose: "password-reset" },
      process.env.JWT_SECRET,
      { expiresIn: RESET_TOKEN_TTL }
    );

    return res.json({ message: "Código verificado", resetToken });
  } catch (error) {
    console.error("VERIFY RESET CODE ERROR:");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({ error: "Error del servidor" });
  }
}

// PASO 3: valida el token emitido en el paso 2 y actualiza la contraseña del usuario.
export async function resetPassword(req, res) {
  try {
    const { valid, errors } = validateResetPasswordPayload(req.body);

    if (!valid) {
      return res.status(400).json({ error: errors[0] });
    }

    const { resetToken, newPassword } = req.body;

    let payload;
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: "El token de recuperación es inválido o expiró" });
    }

    if (payload.purpose !== "password-reset" || !payload.email) {
      return res.status(400).json({ error: "El token de recuperación es inválido" });
    }

    const email = payload.email;

    // El código ya fue consumido: si el registro no existe (o cambió), el token ya no es válido.
    const pending = await pool.query(
      "SELECT email FROM password_resets WHERE email = $1",
      [email]
    );

    if (pending.rows.length === 0) {
      return res.status(400).json({ error: "La solicitud de recuperación ya no es válida, empieza de nuevo" });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [passwordHash, email]
    );

    await pool.query("DELETE FROM password_resets WHERE email = $1", [email]);

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({ error: "Error del servidor" });
  }
}