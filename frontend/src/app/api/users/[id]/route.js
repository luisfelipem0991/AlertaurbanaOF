import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario por ID
 *     description: Elimina un usuario registrado en el sistema usando su identificador único.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario que se desea eliminar.
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuario eliminado
 *       404:
 *         description: No existe un usuario con el ID indicado.
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
export async function DELETE(req, { params }) {
  const auth = requireRole(req, ["ADMIN", "SUPERADMIN"]);
  if (auth.error) return auth.error;

  try {
    const { id } = params;

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return Response.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    return Response.json({ message: "Usuario eliminado" });
  } catch (error) {
    return Response.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
