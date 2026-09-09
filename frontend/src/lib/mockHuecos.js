// ⚠️ DATOS DE EJEMPLO — todavía no existe la tabla "huecos" en la base de
// datos ni los endpoints reales. Esto es solo para maquetar las 3 vistas
// (ciudadano, JAC, Alcaldía) mientras se construye el backend.
//
// Cuando exista la API real, cada campo de aquí debería mapear a una
// columna: gravedadReportada -> la que elige el ciudadano al reportar,
// prioridadJac -> la que asigna la JAC al revisar, estado -> lo que
// cambia la Alcaldía (pendiente | en_proceso | resuelto).

export const MOCK_REPORTS = [
  {
    id: 1,
    direccion: "Cra. 70 con Cl. 45, Laureles",
    descripcion:
      "Hueco profundo en el carril derecho, varios carros lo han esquivado bruscamente generando riesgo de choque.",
    gravedadReportada: "alta",
    prioridadJac: "alta",
    estado: "en_proceso",
    likes: 34,
    fecha: "Hace 2 horas",
    icon: "🚧",
  },
  {
    id: 2,
    direccion: "Av. El Poblado con Cl. 10, El Poblado",
    descripcion:
      "Grieta amplia cerca al andén, se ha ido agrandando con las lluvias de la última semana.",
    gravedadReportada: "media",
    prioridadJac: "media",
    estado: "pendiente",
    likes: 12,
    fecha: "Hace 1 día",
    icon: "🌧️",
  },
  {
    id: 3,
    direccion: "Cl. 33 con Cra. 80, Belén",
    descripcion:
      "Hueco pequeño ya delimitado con cinta por la comunidad mientras llega la reparación oficial.",
    gravedadReportada: "baja",
    prioridadJac: "baja",
    estado: "resuelto",
    likes: 5,
    fecha: "Hace 4 días",
    icon: "🚦",
  },
  {
    id: 4,
    direccion: "Cra. 65 con Cl. 30, Robledo",
    descripcion:
      "Hueco grande justo en la curva, de noche es casi imposible verlo y ya hubo una caída de moto.",
    gravedadReportada: "alta",
    prioridadJac: null,
    estado: "pendiente",
    likes: 21,
    fecha: "Hace 5 horas",
    icon: "🏍️",
  },
  {
    id: 5,
    direccion: "Cl. 50 con Cra. 45, La Candelaria",
    descripcion:
      "Varios huecos pequeños seguidos en el mismo tramo, afectan sobre todo a las busetas.",
    gravedadReportada: "media",
    prioridadJac: null,
    estado: "pendiente",
    likes: 8,
    fecha: "Hace 8 horas",
    icon: "🚌",
  },
];

export const SEVERITY_STYLE = {
  alta: { label: "Gravedad alta", color: "#dc2626", bg: "#fee2e2" },
  media: { label: "Gravedad media", color: "#b45309", bg: "#fef3c7" },
  baja: { label: "Gravedad baja", color: "#16a34a", bg: "#dcfce7" },
};

export const PRIORITY_STYLE = {
  alta: { label: "Prioridad alta", color: "#6d28d9", bg: "#ede9fe" },
  media: { label: "Prioridad media", color: "#6d28d9", bg: "#f3f0fd" },
  baja: { label: "Prioridad baja", color: "#6d28d9", bg: "#f8f7fd" },
};

export const STATUS_STYLE = {
  pendiente: { label: "Pendiente", color: "#6b7280", bg: "#f3f4f6" },
  en_proceso: { label: "En proceso", color: "#1e3a8a", bg: "#ece5e5" },
  resuelto: { label: "Resuelto", color: "#16a34a", bg: "#dcfce7" },
};

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 };

export function sortByPriority(reports) {
  return [...reports].sort((a, b) => {
    const aOrder = a.prioridadJac ? PRIORITY_ORDER[a.prioridadJac] : 99;
    const bOrder = b.prioridadJac ? PRIORITY_ORDER[b.prioridadJac] : 99;
    return aOrder - bOrder;
  });
}
