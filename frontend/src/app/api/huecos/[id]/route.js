import pool from "@/lib/db";
import { requireRole } from "@/lib/auth";

// PATCH /api/huecos/[id]
// Permite actualizar campos de un reporte (prioridad, estado)
export async function PATCH(request, { params }) {
  // Permitimos que JAC, ALCALDIA, ADMIN y SUPERADMIN puedan editar el reporte
  const auth = requireRole(request, ["JAC", "ALCALDIA", "ADMIN", "SUPERADMIN"]);
  if (auth.error) return auth.error;

  try {
    const { id } = params;
    const body = await request.json();

    // Extraemos los campos que se desean actualizar
    const { prioridad, estado } = body;

    // Verificamos que el reporte exista
    const checkResult = await pool.query("SELECT id FROM huecos WHERE id = $1", [id]);
    
    if (checkResult.rows.length === 0) {
      return Response.json(
        { error: "Reporte no encontrado" },
        { status: 404 }
      );
    }

    // Construimos la consulta dinámicamente según los campos recibidos
    let updateFields = [];
    let values = [];
    let valueIndex = 1;

    if (prioridad !== undefined) {
      updateFields.push(`prioridad = $${valueIndex}`);
      values.push(prioridad);
      valueIndex++;
    }

    if (estado !== undefined) {
      updateFields.push(`estado = $${valueIndex}`);
      values.push(estado);
      valueIndex++;
    }

    // Si no enviaron ningún campo válido para actualizar, retornamos error
    if (updateFields.length === 0) {
      return Response.json(
        { error: "No se proporcionaron campos válidos para actualizar" },
        { status: 400 }
      );
    }

    values.push(id); // El ID siempre será el último parámetro

    const query = `
      UPDATE huecos 
      SET ${updateFields.join(", ")}
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return Response.json(result.rows[0]);

  } catch (error) {
    console.error(`PATCH /api/huecos/[id] error:`, error.message);
    return Response.json(
      { error: "Error interno al actualizar el reporte" },
      { status: 500 }
    );
  }
}

