# Política de Seguridad y Reporte de Vulnerabilidades

La seguridad de la información, de los usuarios y de la infraestructura de **Alerta Urbana** es una prioridad fundamental. Agradecemos la colaboración de la comunidad y de los evaluadores para identificar y corregir cualquier potencial falla o vulnerabilidad en nuestro sistema.

---

## 1. Versiones con Soporte de Seguridad

Únicamente las versiones activas del proyecto reciben parches y correcciones de seguridad periódicas:

| Versión | ¿Recibe parches de seguridad? | Estado |
| :--- | :---: | :--- |
| **`0.1.x`** | **Sí** | Versión de entrega actual y en mantenimiento activo |
| `< 0.1.0` | No | Versiones previas de desarrollo monolítico descontinuadas |

---

## 2. Proceso de Reporte Responsable (Responsible Disclosure)

Si descubres una vulnerabilidad de seguridad en el sistema, te solicitamos encarecidamente **NO divulgarla públicamente** a través de GitHub Issues, foros abiertos o redes sociales.

### Canal de Contacto Privado:
Por favor, envía un reporte confidencial detallado a los mantenedores del repositorio:
- **Correo de contacto:** `seguridad.alertaurbana@gmail.com`
- **Contacto alternativo vía GitHub:** Contactar privadamente a los propietarios del repositorio ([@IvanF-24](https://github.com/IvanF-24) o [@luisfelipem0991](https://github.com/luisfelipem0991)) a través de [GitHub Security Advisories](https://github.com/luisfelipem0991/AlertaurbanaOF/security/advisories/new).

### Información que debe contener el reporte:
1. **Tipo de vulnerabilidad:** (ej. Inyección SQL, Cross-Site Scripting, fuga de información sensible, escalada de privilegios, omisión de autenticación).
2. **Componente afectado:** Módulo, ruta de API o vista específica (ej. `/api/login`, `/api/huecos`, carga en Cloudinary).
3. **Pasos para reproducir:** Instrucciones paso a paso o script de prueba de concepto (PoC) simplificado.
4. **Impacto potencial:** Consecuencias que la explotación de la vulnerabilidad tendría sobre la integridad o confidencialidad del sistema.
5. **Mitigación sugerida:** En caso de contar con una propuesta técnica de solución.

---

## 3. Compromiso y Tiempos de Respuesta (SLA)

El equipo de Alerta Urbana asume los siguientes compromisos de atención responsable:
- **Acuse de recibo inicial:** En un plazo máximo de **48 horas** a partir del envío del reporte.
- **Evaluación y validación técnica (Triage):** Máximo **5 días hábiles** para reproducir la falla y clasificar su severidad (Baja, Media, Alta, Crítica).
- **Publicación del parche:** Se emitirá un release o commit correctivo de forma prioritaria tan pronto como la solución haya sido probada, manteniendo la debida atribución al investigador o informante si así lo desea.

---

## 4. Prácticas y Medidas de Seguridad Implementadas

El proyecto incorpora las siguientes capas y salvaguardas de seguridad desde el diseño:
- **Protección contra inyección y manipulación de payloads:** Validadores estrictos en servidor que comprueban longitud, tipado y **rechazan explícitamente cualquier campo no definido** en los esquemas de registro y autenticación.
- **Almacenamiento seguro de credenciales:** Uso del algoritmo `bcrypt` con factor de coste balanceado para el hash unidireccional de contraseñas de usuarios.
- **Autenticación mediante JWT:** Firmado con claves secretas de alta entropía (`JWT_SECRET`) y tiempos de vigencia controlados.
- **Aislamiento total de secretos:** Credenciales de base de datos Neon PostgreSQL, API Keys de Azure Maps, tokens OAuth2 de Google Cloud y llaves de Cloudinary administradas exclusivamente por variables de entorno y secretos en la nube, nunca hardcodeadas ni versionadas.
- **Políticas estrictas de CORS:** Filtro de orígenes cruzados en Express limitado a los dominios del frontend oficial (`https://alertaurbanav1.z13.web.core.windows.net`) y entornos de desarrollo controlados.

