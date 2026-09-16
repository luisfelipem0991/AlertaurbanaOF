import pool from "../config/db.js";

// Crear JAC
export async function createJac(req, res) {
  try {
    const { nombre, descripcion, barrios } = req.body;
    
    if (!nombre) return res.status(400).json({ error: "El nombre de la JAC es requerido" });
    
    await pool.query("BEGIN");
    
    // Insertar JAC
    const jacResult = await pool.query(
      "INSERT INTO juntas_comunales (nombre, descripcion) VALUES ($1, $2) RETURNING *",
      [nombre, descripcion]
    );
    const newJac = jacResult.rows[0];
    
    // Insertar Barrios
    if (barrios && Array.isArray(barrios)) {
      for (const barrio of barrios) {
        if (barrio && barrio.trim()) {
            await pool.query(
            "INSERT INTO jac_barrios (jac_id, barrio_name) VALUES ($1, $2)",
            [newJac.id, barrio.trim()]
            );
        }
      }
    }
    
    await pool.query("COMMIT");
    
    newJac.barrios = barrios || [];
    return res.status(201).json(newJac);
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error creating JAC:", error);
    if (error.code === '23505') { // unique violation
      return res.status(400).json({ error: "Uno de los barrios ya está asignado a otra JAC." });
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Obtener JACs
export async function getJacs(req, res) {
  try {
    const jacsResult = await pool.query("SELECT * FROM juntas_comunales ORDER BY created_at DESC");
    const jacs = jacsResult.rows;
    
    const barriosResult = await pool.query("SELECT * FROM jac_barrios");
    const allBarrios = barriosResult.rows;
    
    // Mapear barrios a sus respectivas JACs
    const jacsConBarrios = jacs.map(jac => {
      const barriosDeJac = allBarrios.filter(b => b.jac_id === jac.id).map(b => b.barrio_name);
      return { ...jac, barrios: barriosDeJac };
    });
    
    return res.json(jacsConBarrios);
  } catch (error) {
    console.error("Error getting JACs:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

// Actualizar JAC
export async function updateJac(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, barrios } = req.body;
    
    if (!nombre) return res.status(400).json({ error: "El nombre de la JAC es requerido" });
    
    await pool.query("BEGIN");
    
    // Actualizar nombre y descripcion
    const jacResult = await pool.query(
      "UPDATE juntas_comunales SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *",
      [nombre, descripcion, id]
    );
    
    if (jacResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ error: "JAC no encontrada" });
    }
    
    const updatedJac = jacResult.rows[0];
    
    // Eliminar barrios viejos
    await pool.query("DELETE FROM jac_barrios WHERE jac_id = $1", [id]);
    
    // Insertar barrios nuevos
    if (barrios && Array.isArray(barrios)) {
      for (const barrio of barrios) {
        if (barrio && barrio.trim()) {
            await pool.query(
            "INSERT INTO jac_barrios (jac_id, barrio_name) VALUES ($1, $2)",
            [id, barrio.trim()]
            );
        }
      }
    }
    
    await pool.query("COMMIT");
    
    updatedJac.barrios = barrios ? barrios.map(b => b.trim()).filter(b => b) : [];
    return res.json(updatedJac);
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error updating JAC:", error);
    if (error.code === '23505') { // unique violation
      return res.status(400).json({ error: "Uno de los barrios ya está asignado a otra JAC." });
    }
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}

