import pool from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { validateLoginPayload } from "@/lib/validators";
import { SESSION_COOKIE } from "@/lib/auth";

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Valida las credenciales del usuario y genera un token JWT para acceder a rutas protegidas.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       description: Credenciales del usuario registrado.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@alertaurbana.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Juan Pérez
 *                     role:
 *                       type: string
 *                       example: ciudadano
 *       400:
 *         description: Credenciales inválidas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error del servidor
 */
export async function POST(req) {
  console.log("=== LOGIN API EJECUTADA ===");

  try {
    const body = await req.json();
    const { valid, errors } = validateLoginPayload(body);

    if (!valid) {
      return Response.json({ error: errors[0] }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    const { password } = body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 400 });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return Response.json({ error: "Contraseña incorrecta" }, { status: 400 });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json({
      message: "Login exitoso",
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
