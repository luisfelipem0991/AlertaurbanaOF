-- Ejecuta este script una sola vez sobre la base de datos PostgreSQL de Alerta Urbana.
-- Permite usuarios creados con Google, que no tienen contraseña local.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255) UNIQUE;

ALTER TABLE users
  ALTER COLUMN password DROP NOT NULL;
