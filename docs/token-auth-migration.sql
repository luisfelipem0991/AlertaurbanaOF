-- Ejecuta este script una sola vez sobre la base de datos PostgreSQL de Alerta Urbana.
-- Agrega soporte para la arquitectura de Token en Memoria (OWASP).

-- 1. Columna para rotación de refresh tokens (detecta reuso malicioso)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS refresh_version INTEGER DEFAULT 0;

-- 2. Asegurar que password permite NULL (cuentas de Google no tienen contraseña)
ALTER TABLE users
  ALTER COLUMN password DROP NOT NULL;

-- 3. Asegurar que role tiene un valor por defecto para cuentas nuevas
ALTER TABLE users
  ALTER COLUMN role SET DEFAULT 'USER';

