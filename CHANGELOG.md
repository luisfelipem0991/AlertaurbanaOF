# Registro de Cambios (Changelog)

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Sin Publicar] - Unreleased

### Planeado
- Implementación de notificaciones push móviles para el seguimiento de reportes en tiempo real.
- Panel de análisis predictivo sobre puntos críticos de deterioro vial por zonas y comunas.

---

## [0.1.0] - 2026-09-22

### Añadido (Added)
- **Separación arquitectónica Frontend/Backend:** Estructuración modular con Next.js 16 en el cliente (`frontend/`) y Express 5 en el servidor (`backend/`), orquestados con Docker Compose.
- **Sistema de Autenticación Híbrida:**
  - Autenticación tradicional basada en correo y contraseña con tokens JWT y hashing de contraseñas mediante `bcrypt`.
  - Autenticación federada mediante Google OAuth2 (`/api/auth/google`, `/api/auth/token`).
- **Módulo de Reporte y Georreferenciación de Daños Viales (Huecos/Baches):**
  - Creación, consulta y actualización de estado de reportes ciudadanos.
  - Integración interactiva con mapas mediante Azure Maps Web SDK.
- **Gestión Comunitaria (JACs):**
  - Soporte y vinculación de reportes viales a Juntas de Acción Comunal (JACs) locales para priorización ciudadana.
- **Gestión Multimedia de Evidencias:**
  - Carga, almacenamiento y optimización de fotografías de baches viales mediante el servicio en la nube Cloudinary.
- **Recuperación de Contraseña:**
  - Flujo de restablecimiento seguro vía código de verificación temporal enviado por correo electrónico.
- **Servicio de Notificaciones por Correo:**
  - Implementación de cliente de mensajería integrado directamente con la API REST de Gmail (`googleapis`) mediante credenciales OAuth2.
- **Documentación Interactiva de APIs:**
  - Integración de Swagger UI y especificación OpenAPI (`/api/swagger`, `/api-docs`).
- **Suites de Pruebas Automatizadas:**
  - Pruebas unitarias de componentes e interfaces en frontend utilizando Jest y React Testing Library.
  - Pruebas unitarias de controladores y validadores en backend utilizando el runner nativo de Node.js (`node --test`).
- **CI/CD para Despliegue Continuo:**
  - Flujo automatizado en GitHub Actions (`deploy-storage.yml`) para compilar y sincronizar el frontend estático con Azure Blob Storage (`$web`).

### Modificado (Changed)
- **Migración del servicio de correo:** Sustitución del transporte SMTP tradicional (Nodemailer) por llamadas directas a la API REST de Gmail (`googleapis`) vía OAuth2, solucionando bloqueos de puertos de salida en Railway.
- **Configuración de CORS y Enrutamiento:** Incorporación de orígenes permitidos explícitos y soporte de `trailingSlash` en Next.js para compatibilidad completa con el hosting estático de Azure Blob Storage.
- **Conectividad a Base de Datos:** Configuración de pool de conexiones PostgreSQL seguro (SSL activado) optimizado para bases de datos serverless en Neon.

### Corregido (Fixed)
- **Resolución de Red IPv6 en Railway:** Configuración de resolución DNS forzada a IPv4 (`dns.setDefaultResultOrder("ipv4first")`) para solventar errores de conexión `ENETUNREACH`.
- **Manejo de Cookies Cross-Domain:** Corrección en el intercambio de tokens de sesión entre el frontend alojado en Azure y el backend alojado en Railway.
- **Duplicación en Suites de Pruebas:** Limpieza de bloques de prueba y declaraciones duplicadas en `login-page.test.jsx` y `register-page.test.jsx`.

### Seguridad (Security)
- **Validación Estricta de Payloads:** Implementación de validadores en backend y frontend que rechazan campos no autorizados (prevención de manipulación de roles de usuario o escalada de privilegios).
- **Control de Longitud y Complejidad:** Validación estricta de contraseñas (8 a 72 caracteres) y formatos de correo electrónico estándar.
- **Protección de Secretos:** Externalización de claves sensibles (`JWT_SECRET`, credenciales de base de datos y Google OAuth2) mediante variables de entorno aisladas del control de versiones.

