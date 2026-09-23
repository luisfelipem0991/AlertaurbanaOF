# Alerta Urbana 🚦📍

> **Plataforma web ciudadana para el reporte, geolocalización, seguimiento y gestión comunitaria del estado de la malla vial urbana.**

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue.svg)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5.1.0-lightgrey.svg)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%28Neon%29-336791.svg)](https://neon.tech/)
[![Frontend Deploy](https://img.shields.io/badge/Deploy-Azure%20Storage-0078D4.svg)](https://alertaurbanav1.z13.web.core.windows.net)
[![Backend Deploy](https://img.shields.io/badge/Deploy-Railway-0B0D0E.svg)](https://railway.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📑 Tabla de Contenidos

1. [Descripción del Proyecto](#-descripción-del-proyecto)
2. [Características Principales](#-características-principales)
3. [Arquitectura y Stack Tecnológico](#-arquitectura-y-stack-tecnológico)
4. [Enlaces Oficiales del Proyecto](#-enlaces-oficiales-del-proyecto)
5. [Estructura del Repositorio](#-estructura-del-repositorio)
6. [Requisitos Previos](#-requisitos-previos)
7. [Instalación y Configuración](#-instalación-y-configuración)
8. [Ejecución del Sistema](#-ejecución-del-sistema)
9. [Ejecución de Pruebas Automatizadas](#-ejecución-de-pruebas-automatizadas)
10. [Reproducibilidad de Dependencias (Lockfiles)](#-reproducibilidad-de-dependencias-lockfiles)
11. [Despliegue e Infraestructura](#-despliegue-e-infraestructura)
12. [Gobernanza y Documentación Complementaria](#-gobernanza-y-documentación-complementaria)
13. [Equipo de Desarrollo](#-equipo-de-desarrollo)

---

## 📖 Descripción del Proyecto

**Alerta Urbana** es una solución integral diseñada para empoderar a la ciudadanía en la identificación y reporte oportuno del deterioro vial (huecos, baches y fallas asfálticas) en sus comunidades. 

La plataforma articula los esfuerzos de los ciudadanos con las **Juntas de Acción Comunal (JACs)** y las autoridades municipales competentes, proporcionando herramientas interactivas de geolocalización, trazabilidad del estado de intervención de cada daño reportado y tableros estadísticos para la priorización eficiente de recursos públicos.

---

## ✨ Características Principales

- 🗺️ **Reporte Georreferenciado en Tiempo Real:** Selección precisa de puntos geográficos sobre mapas interactivos mediante **Azure Maps Web SDK**.
- 📸 **Evidencias Multimedia:** Captura y subida optimizada de fotografías del deterioro vial utilizando la nube de **Cloudinary**.
- 🔐 **Autenticación Híbrida y Robusta:** Inicio de sesión y registro tradicional cifrado con `bcrypt` y tokens `JWT`, sumado a inicio de sesión federado mediante **Google OAuth2**.
- 🏛️ **Articulación Comunitaria (JACs):** Vinculación de reportes a sectores y Juntas de Acción Comunal para una gestión barrial organizada.
- ✉️ **Notificaciones y Recuperación de Cuentas:** Envío confiable de códigos de verificación mediante la API REST de **Gmail (`googleapis`)** con autorización OAuth2.
- 📊 **Panel Administrativo:** Visualización de métricas, filtrado de incidencias y actualización del ciclo de vida de los reportes (Pendiente, En Revisión, Reparado).
- 📜 **API REST Autodocumentada:** Especificación e interfaz interactiva OpenAPI generada con **Swagger UI**.

---

## 🏗️ Arquitectura y Stack Tecnológico

El proyecto está estructurado bajo una arquitectura desacoplada y moderna que separa de forma limpia el cliente y el servidor:

```text
┌────────────────────────────────────────────────────────┐
│                   Cliente (Frontend)                   │
│        Next.js 16 (App Router) + React 19 + Tailwind   │
│     Desplegado en: Azure Blob Storage (Static Web)     │
└───────────────┬────────────────────────▲───────────────┘
                │                        │
       REST API / JSON          CORS Seguro & JWT
                │                        │
┌───────────────▼────────────────────────┴───────────────┐
│                   Servidor (Backend)                   │
│               Node.js 20+ con Express 5                │
│                 Desplegado en: Railway                 │
└──────┬───────────────┬────────────────┬───────────────┬┘
       │               │                │               │
       ▼               ▼                ▼               ▼
┌────────────┐  ┌─────────────┐  ┌────────────┐  ┌────────────┐
│ PostgreSQL │  │ Azure Maps  │  │ Cloudinary │  │ Gmail API  │
│   (Neon)   │  │   Web SDK   │  │ Media CDN  │  │   OAuth2   │
└────────────┘  └─────────────┘  └────────────┘  └────────────┘
```

### Tecnologías Utilizadas:

- **Frontend:**
  - Next.js 16.1.6 (App Router y Static Export)
  - React 19.2.3
  - Tailwind CSS v4
  - Azure Maps SDK (`@googlemaps/js-api-loader` / Azure Maps Services)
  - Recharts & SweetAlert2
- **Backend:**
  - Node.js 20+
  - Express 5.1.0
  - PostgreSQL Driver (`pg` 8.22) con Neon Serverless
  - JSON Web Tokens (`jsonwebtoken`)
  - Encriptación con `bcrypt`
  - Integración Google Cloud (`googleapis`)
- **Infraestructura & CI/CD:**
  - GitHub Actions (`deploy-storage.yml`)
  - Azure Blob Storage (`$web`)
  - Railway Cloud PaaS
  - Docker & Docker Compose

---

## 🔗 Enlaces Oficiales del Proyecto

| Recurso | Enlace |
| :--- | :--- |
| 🌐 **Aplicación en Producción (Frontend)** | [https://alertaurbanav1.z13.web.core.windows.net/](https://alertaurbanav1.z13.web.core.windows.net/) |
| 📚 **Documentación Swagger / API** | [http://localhost:4000/api/docs](http://localhost:4000/api/docs) (o ruta `/api-docs` en frontend) |
| 💻 **Repositorio de Código (GitHub)** | [https://github.com/luisfelipem0991/AlertaurbanaOF](https://github.com/luisfelipem0991/AlertaurbanaOF) |
| 📋 **Historial de Versiones** | [CHANGELOG.md](CHANGELOG.md) |
| ⚖️ **Licencia de Software** | [LICENSE](LICENSE) |
| 🤝 **Guía de Contribución** | [CONTRIBUTING.md](CONTRIBUTING.md) |
| 🛡️ **Política de Seguridad** | [SECURITY.md](SECURITY.md) |
| 📑 **Bitácora de Migración** | [docs/MIGRATION.md](docs/MIGRATION.md) |

---

## 📁 Estructura del Repositorio

```text
AlertaurbanaOF/
├── .github/
│   ├── workflows/
│   │   └── deploy-storage.yml    # Pipeline CI/CD para Azure Blob Storage
│   └── CODEOWNERS                # Asignación de revisión de código
├── backend/                      # Servidor API REST en Express
│   ├── src/
│   │   ├── config/               # Conexión a PostgreSQL (Neon)
│   │   ├── controllers/          # Controladores de negocio (auth, huecos, JACs, users)
│   │   ├── middleware/           # Middleware de verificación JWT
│   │   ├── routes/               # Enrutadores Express modulares
│   │   ├── utils/                # Validadores, Gmail REST client, OAuth2
│   │   ├── __tests__/            # Pruebas unitarias de controladores
│   │   └── server.js             # Entrada principal del backend
│   ├── Dockerfile                # Imagen Docker de producción backend
│   ├── package.json              # Dependencias y scripts del backend
│   └── package-lock.json         # Lockfile determinista del backend
├── frontend/                     # Aplicación cliente en Next.js
│   ├── src/
│   │   ├── app/                  # Páginas y rutas App Router (login, register, huecos, admin)
│   │   ├── context/              # Contextos globales de React (AuthContext)
│   │   ├── lib/                  # Validadores y utilidades de cliente
│   │   └── __test__/             # Pruebas unitarias en Jest / RTL
│   ├── public/                   # Activos estáticos, iconos e imágenes
│   ├── Dockerfile                # Imagen Docker de frontend estático
│   ├── jest.config.js            # Configuración de pruebas Jest
│   ├── next.config.mjs           # Configuración de compilación y export de Next.js
│   ├── package.json              # Dependencias y scripts del frontend
│   └── package-lock.json         # Lockfile determinista del frontend
├── docs/                         # Documentación técnica adicional y scripts SQL
├── docker-compose.yml            # Orquestador multi-contenedor local
├── .gitignore                    # Exclusiones globales de Git
├── CHANGELOG.md                  # Registro de cambios cronológico
├── CODEOWNERS                    # Responsables de rutas críticas
├── CONTRIBUTING.md               # Normas de ramas, commits y PRs
├── LICENSE                       # Licencia MIT de distribución
├── README.md                     # Entrada y documentación principal
└── SECURITY.md                   # Política de reporte de vulnerabilidades
```

---

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de contar con el siguiente software instalado en tu estación de trabajo:

- **Node.js:** Versión 20.x LTS o superior ([Descargar](https://nodejs.org/))
- **npm:** Versión 10.x o superior (incluido con Node.js)
- **Git:** Versión 2.30 o superior ([Descargar](https://git-scm.com/))
- **Docker y Docker Compose:** (Opcional, si deseas ejecutar el sistema en contenedores)
- **Cuentas y servicios en la nube requeridos:**
  - Base de datos relacional en [Neon Serverless PostgreSQL](https://neon.tech/)
  - Llave de API en [Azure Maps](https://azure.microsoft.com/products/azure-maps/)
  - Cuenta y preset de subida en [Cloudinary](https://cloudinary.com/)
  - Proyecto en [Google Cloud Console](https://console.cloud.google.com/) con credenciales OAuth2 y API de Gmail habilitada.

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio

```bash
git clone https://github.com/luisfelipem0991/AlertaurbanaOF.git
cd AlertaurbanaOF
```

### 2. Configurar el Backend

1. Entra al directorio `backend`:
   ```bash
   cd backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea tu archivo de entorno `backend/.env` con las variables correspondientes:
   ```env
   PORT=4000
   DATABASE_URL=postgresql://usuario:password@ep-ejemplo.us-east-2.aws.neon.tech/alertaurbana?sslmode=require
   JWT_SECRET=tu_clave_secreta_jwt_super_segura
   FRONTEND_URL=http://localhost:3000

   # Configuración de Google OAuth2 / Gmail REST API
   GMAIL_USER=tucuenta@gmail.com
   GMAIL_CLIENT_ID=tu-cliente-id.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=tu-cliente-secret
   GMAIL_REFRESH_TOKEN=tu-refresh-token
   ```

### 3. Configurar el Frontend

1. En una nueva terminal, entra al directorio `frontend`:
   ```bash
   cd frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea tu archivo de entorno `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   NEXT_PUBLIC_AZURE_MAPS_KEY=tu_azure_maps_subscription_key
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=tu_upload_preset
   ```

---

## 💻 Ejecución del Sistema

Puedes levantar la aplicación utilizando cualquiera de las siguientes modalidades:

### Opción A: Ejecución en Desarrollo (Recomendada para programar)

1. **Levantar el Backend:**
   ```bash
   cd backend
   npm run dev
   ```
   *El servidor iniciará en:* `http://localhost:4000`

2. **Levantar el Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   *La aplicación estará disponible en:* `http://localhost:3000`

---

### Opción B: Ejecución con Docker Compose

Si cuentas con Docker instalado, puedes orquestar ambos servicios de forma simultánea:

```bash
# Construir y levantar contenedores en segundo plano
docker compose up --build

# Para detener los servicios
docker compose down
```

---

## 🧪 Ejecución de Pruebas Automatizadas

El proyecto cuenta con suites de pruebas unitarias y de validación para garantizar la solidez y estabilidad del sistema:

### Pruebas del Backend (Node.js Native Test Runner)
Verifica la lógica de los controladores y validadores estrictos anti-inyección de payloads:
```bash
cd backend
npm test
```

### Pruebas del Frontend (Jest + React Testing Library)
Ejecuta las pruebas de interfaz y componentes en entorno jsdom:
```bash
cd frontend
npm test
```

### Generación de Reporte de Cobertura (Coverage):
```bash
cd frontend
npm run coverage
```

---

## 🔒 Reproducibilidad de Dependencias (Lockfiles)

Para garantizar entornos de ejecución 100% idénticos y reproducibles entre desarrolladores, servidores de integración continua (CI) y plataformas de despliegue en la nube, el repositorio incluye bajo estricto control de versiones:

- **`backend/package-lock.json`**
- **`frontend/package-lock.json`**

Al desplegar o instalar en entornos de integración continua o producción, se recomienda ejecutar la instalación limpia basada en el lockfile:

```bash
# En lugar de npm install, usar:
npm ci
```

Esto evita discrepancias en versiones menores o parches de dependencias transitivas.

---

## ☁️ Despliegue e Infraestructura

1. **Frontend (Azure Blob Storage):**
   - El pipeline en `.github/workflows/deploy-storage.yml` se activa automáticamente en cada `push` a la rama `main`.
   - Ejecuta `npm run build` en `frontend/` para generar la exportación estática en `frontend/out`.
   - Utiliza `az storage blob sync` para sincronizar los archivos estáticos en el contenedor `$web` de la cuenta de almacenamiento `alertaurbanav1`.

2. **Backend (Railway):**
   - El servicio Node.js se despliega en Railway escuchando peticiones en `0.0.0.0` sobre el puerto dinámico asignado (`process.env.PORT`).
   - Se incluye ajuste para forzar resolución DNS IPv4 en conexiones externas.

3. **Base de Datos (Neon):**
   - Base de datos PostgreSQL relacional con cómputo sin servidor y conexiones protegidas mediante TLS/SSL (`sslmode=require`).

---

## 📚 Gobernanza y Documentación Complementaria

- 🤝 **[Guía de Contribución (CONTRIBUTING.md)](CONTRIBUTING.md):** Convenciones de ramas, formato de commits y proceso de revisión de Pull Requests.
- 📜 **[Historial de Versiones (CHANGELOG.md)](CHANGELOG.md):** Registro cronológico detallado de cambios según el estándar Keep a Changelog.
- 🛡️ **[Política de Seguridad (SECURITY.md)](SECURITY.md):** Canales y lineamientos para divulgación responsable de vulnerabilidades.
- ⚖️ **[Términos de Licenciamiento (LICENSE)](LICENSE):** Condiciones legales de uso bajo la licencia MIT.
- 👥 **[Propietarios de Código (CODEOWNERS)](CODEOWNERS):** Asignación de responsabilidades por módulos críticos del sistema.
- 📑 **[Bitácora de Migración (docs/MIGRATION.md)](docs/MIGRATION.md):** Registro de la evolución arquitectónica de monolito a frontend/backend.

---

## 👥 Equipo de Desarrollo

Proyecto desarrollado y mantenido por:

- **IvanF-24** ([GitHub](https://github.com/IvanF-24))
- **luisfelipem0991** - Luis Felipe ([GitHub](https://github.com/luisfelipem0991))

---
*Alerta Urbana © 2026 - Todos los derechos reservados.*

