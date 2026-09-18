import pool from "../config/db.js";

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    console.log("Creating juntas_comunales table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS juntas_comunales (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("Creating jac_barrios table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS jac_barrios (
        id SERIAL PRIMARY KEY,
        jac_id INTEGER REFERENCES juntas_comunales(id) ON DELETE CASCADE,
        barrio_name VARCHAR(255) NOT NULL UNIQUE
      );
    `);

    console.log("Adding jac_id to users...");
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS jac_id INTEGER REFERENCES juntas_comunales(id) ON DELETE SET NULL;
    `);

    await client.query("COMMIT");
    console.log("Migration successful!");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();

