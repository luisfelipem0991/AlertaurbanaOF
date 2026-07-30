import crypto from "crypto";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { validateRegisterPayload, validateVerifyCodePayload } from "../utils/validators.js";
import { sendVerificationCodeEmail } from "../utils/mailer.js";

const CODE_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;

function generateCode() {
  // Código de 4 dígitos, incluye ceros a la izquierda (ej: "0043")
  return String(crypto.randomInt(0, 10000)).padStart(4, "0");
}

// PASO 1: valida los datos, genera un código de 4 dígitos y lo envía por correo.
// Todavía NO crea el usuario en "users".
export async function sendCode(req, res) {
  try {
    const { valid, errors } = validateRegisterPayload(req.body);

    if (!valid) {
      return res.status(400).json({ error: errors[0] });
    }

    const name = req.body.name.trim();
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const code = generateCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

    await pool.query(
      `INSERT INTO pending_registrations (email, name, password_hash, code, attempts, expires_at)
       VALUES ($1, $2, $3, $4, 0, $5)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         code = EXCLUDED.code,
         attempts = 0,
         expires_at = EXCLUDED.expires_at,
         created_at = NOW()`,
      [email, name, passwordHash, code, expiresAt]
    );

    await sendVerificationCodeEmail(email, code);

    return res.json({ message: "Código enviado al correo" });
  } catch (error) {
    console.error("SEND CODE ERROR:");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({ error: "Error del servidor" });
  }
}

// PASO 2: valida el código de 4 dígitos y, si es correcto, crea el usuario real.
export async function verifyCode(req, res) {
  try {
    const { valid, errors } = validateVerifyCodePayload(req.body);

    if (!valid) {
      return res.status(400).json({ error: errors[0] });
    }

    const email = req.body.email.trim().toLowerCase();
    const code = req.body.code.trim();

    const result = await pool.query(
      "SELECT * FROM pending_registrations WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "No hay un registro pendiente para este correo" });
    }

    const pending = result.rows[0];

    if (new Date(pending.expires_at) < new Date()) {
      await pool.query("DELETE FROM pending_registrations WHERE email = $1", [email]);
      return res.status(400).json({ error: "El código expiró, solicita uno nuevo" });
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      await pool.query("DELETE FROM pending_registrations WHERE email = $1", [email]);
      return res.status(400).json({ error: "Demasiados intentos, solicita un nuevo código" });
    }

    if (pending.code !== code) {
      await pool.query(
        "UPDATE pending_registrations SET attempts = attempts + 1 WHERE email = $1",
        [email]
      );
      return res.status(400).json({ error: "Código incorrecto" });
    }

    // Código correcto: crea el usuario real y limpia el registro pendiente.
    const userExists = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      await pool.query("DELETE FROM pending_registrations WHERE email = $1", [email]);
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [pending.name, email, pending.password_hash]
    );

    await pool.query("DELETE FROM pending_registrations WHERE email = $1", [email]);

    return res.json({ message: "Usuario creado correctamente" });
  } catch (error) {
    console.error("VERIFY CODE ERROR:");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({ error: "Error del servidor" });
  }
}
