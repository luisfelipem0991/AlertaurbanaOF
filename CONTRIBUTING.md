# Guía de Contribución y Reglas de Colaboración

¡Te damos la bienvenida al proyecto **Alerta Urbana**! Para garantizar un flujo de trabajo ordenado, trazable y de alta calidad técnica en nuestro equipo de desarrollo, hemos establecido las siguientes pautas y normas obligatorias de colaboración.

---

## 1. Modelo de Ramas (Branching Model)

El proyecto sigue un flujo de trabajo estructurado basado en ramas para evitar conflictos directos en el código fuente de producción:

```text
main (producción estable)
  ▲
  └── dev (integración)
        ▲
        ├── feature/nombre-funcionalidad
        ├── fix/nombre-del-bug
        └── docs/actualizacion-documentacion
```

### Reglas de las Ramas:

- **`main`:** Contiene exclusivamente código verificado y listo para despliegue en producción (Azure / Railway). **Prohibido realizar `push` directo a esta rama.**
- **`dev`:** Rama principal de integración donde confluyen las características completadas antes de pasar a producción.
- **`feature/<nombre>`:** Ramas individuales o grupales creadas a partir de `dev` para implementar una nueva funcionalidad (por ejemplo, `feature/ivan`, `feature/geolocalizacion`, `feature/gestion-jacs`).
- **`fix/<nombre>`:** Ramas para corregir bugs o incidencias detectadas en `dev` o `main` (por ejemplo, `fix/cors-origin`, `fix/mailer-resolution`).
- **`docs/<nombre>`:** Ramas dedicadas exclusivamente a actualización y mejora de la documentación.

---

## 2. Convención de Mensajes de Commit

Adoptamos el estándar **[Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/)** para mantener un historial de cambios legible, uniforme y trazable:

### Estructura:

```text
<tipo>(<alcance opcional>): <descripción clara en presente o imperativo>

[cuerpo opcional que explique el contexto o justificación del cambio]

[pie opcional con referencias a issues o PRs relacionados]
```

### Tipos de Commits:

- **`feat`:** Una nueva funcionalidad o módulo (ej. `feat(auth): implementar inicio de sesión con Google OAuth2`).
- **`fix`:** Corrección de un error o comportamiento defectuoso (ej. `fix(mailer): forzar resolución IPv4 para conexión en Railway`).
- **`docs`:** Modificaciones o adiciones en la documentación (ej. `docs: actualizar README y guía de contribución`).
- **`test`:** Inclusión o ajuste de pruebas unitarias o de integración (ej. `test(validators): añadir casos de prueba para registro de usuarios`).
- **`refactor`:** Modificación del código que ni soluciona un bug ni agrega una funcionalidad (ej. `refactor(db): modularizar pool de conexión PostgreSQL`).
- **`style`:** Cambios de formato, identación o estilo que no alteran la lógica.
- **`chore`:** Tareas de mantenimiento, actualización de dependencias o scripts auxiliares.

---

## 3. Flujo de Trabajo y Pull Requests (PR)

Para integrar cualquier cambio al repositorio, es indispensable seguir este proceso:

### Paso a paso:

1. **Sincronizar la rama base:**
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. **Crear una rama de trabajo:**
   ```bash
   git checkout -b feature/mi-funcionalidad
   ```
3. **Realizar cambios y pruebas locales:**
   - Asegúrate de que las pruebas unitarias pasen sin errores:
     ```bash
     cd backend && npm test
     cd ../frontend && npm test
     ```
4. **Hacer commit siguiendo las convenciones:**
   ```bash
   git add .
   git commit -m "feat(huecos): agregar filtro por estado de reparación"
   ```
5. **Subir la rama al repositorio remoto:**
   ```bash
   git push origin feature/mi-funcionalidad
   ```
6. **Abrir el Pull Request en GitHub:**
   - Selecciona como rama base `dev` (o `main` si es un release preparado).
   - Asigna un título descriptivo siguiendo el formato de Conventional Commits.
   - Describe en el cuerpo:
     - ¿Qué problema soluciona o qué funcionalidad agrega?
     - ¿Qué archivos fueron impactados?
     - ¿Cómo se puede probar el cambio?

---

## 4. Criterios de Revisión y Aceptación de Código (Code Review)

Todo Pull Request requiere revisión por pares antes de ser integrado:

- **Asignación obligatoria de revisores:**
  - El PR debe ser asignado a al menos un miembro del equipo (`@IvanF-24` o `@luisfelipem0991`).
- **Checklist de Calidad:**
  - [ ] El código no incluye archivos `.env`, credenciales ni secretos hardcodeados.
  - [ ] No se modificaron archivos no relacionados a la tarea asignada.
  - [ ] Todas las pruebas automatizadas del proyecto se ejecutan y pasan satisfactoriamente.
  - [ ] La documentación y comentarios en el código son claros y pertinentes.
  - [ ] No existen conflictos de merge pendientes con la rama destino.
- **Aprobación final:**
  - Al menos una aprobación formal (LGTM / Approved) es requerida.
  - Se recomienda usar **Squash and Merge** o **Rebase and Merge** para mantener un historial lineal y limpio en la rama receptora.
