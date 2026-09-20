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

// Prueba de conexión inicial
pool
  .query("SELECT NOW()")
  .then(() => console.log("Conexión a PostgreSQL (Neon) establecida con éxito."))
  .catch((e) => console.error("Error al conectar con la base de datos:", e.message));

export default pool;
