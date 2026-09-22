import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import pkg from "pg";
const { Pool } = pkg;

// Validación de la variable de entorno
if (!process.env.DATABASE_URL) {
  console.error("ERROR CRÍTICO: DATABASE_URL no está definida en las variables de entorno.");
} else {
  console.log("DATABASE_URL configurada: SÍ");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Requerido para conexiones SSL con Neon
  },
});

async function initDb() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255) UNIQUE;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_version INTEGER DEFAULT 0;
      ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
      ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';
    `);
    console.log("Esquema de base de datos verificado y actualizado con éxito.");
  } catch (err) {
    console.warn("Aviso al verificar esquema de base de datos:", err.message);
  }
}

// Prueba de conexión inicial
pool
  .query("SELECT NOW()")
  .then(() => {
    console.log("Conexión a PostgreSQL (Neon) establecida con éxito.");
    initDb();
  })
  .catch((e) => console.error("Error al conectar con la base de datos:", e.message));

export default pool;
