"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// 🧪 Solo para revisar el diseño de las 3 vistas por rol mientras no existe
// el control de acceso real (roles JAC / ALCALDIA todavía no están en el
// backend). Cuando eso exista, cada vista se protege como ya se hace en
// /admin (revisando el rol del token) y esta barra se puede quitar.
const TABS = [
  { href: "/huecos", label: "👤 Ciudadano" },
  { href: "/huecos/jac", label: "🧭 JAC" },
  { href: "/huecos/alcaldia", label: "🏛️ Alcaldía" },
];

export default function DemoRoleSwitcher() {
  const pathname = usePathname();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "8px",
        padding: "10px",
        backgroundColor: "#111827",
      }}
    >
      <span style={{ color: "#9ca3af", fontSize: "12px", alignSelf: "center", marginRight: "8px" }}>
        Vista de prueba:
      </span>
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              fontSize: "13px",
              fontWeight: "700",
              padding: "6px 14px",
              borderRadius: "999px",
              textDecoration: "none",
              color: active ? "#111827" : "#e5e7eb",
              backgroundColor: active ? "white" : "rgba(255,255,255,0.1)",
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
