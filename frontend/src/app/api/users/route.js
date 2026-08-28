import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios
 *     description: Retorna la lista completa de usuarios registrados, ordenados desde el más reciente al más antiguo.
 *     tags:
 *       - Usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       500:
 *         description: Error interno del servidor al consultar los usuarios.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error al consultar los usuarios
 */
// 🔍 OBTENER TODOS LOS USUARIOS
export async function GET(request) {
  const auth = requireRole(request, ["ADMIN", "SUPERADMIN"]);
  if (auth.error) return auth.error;

  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY created_at DESC"
    );

    return Response.json(result.rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
