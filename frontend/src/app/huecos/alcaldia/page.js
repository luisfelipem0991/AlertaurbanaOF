"use client";

import { useState } from "react";
import DemoRoleSwitcher from "../DemoRoleSwitcher";
import { MOCK_REPORTS, SEVERITY_STYLE, PRIORITY_STYLE, STATUS_STYLE, sortByPriority } from "@/lib/mockHuecos";

function AlcaldiaRow({ report, onSetStatus }) {
  const severity = SEVERITY_STYLE[report.gravedadReportada];
  const priority = PRIORITY_STYLE[report.prioridadJac];
  const status = STATUS_STYLE[report.estado];

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "18px",
        padding: "18px 22px",
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "center",
        boxShadow: "0 6px 18px -8px rgba(15, 23, 42, 0.15)",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontWeight: "800",
          padding: "6px 12px",
          borderRadius: "10px",
          backgroundColor: priority.bg,
          color: priority.color,
          textAlign: "center",
          minWidth: "96px",
        }}
      >
        {priority.label}
      </div>

      <div style={{ fontSize: "28px" }}>{report.icon}</div>

      <div style={{ flex: 1, minWidth: "220px" }}>
        <p style={{ margin: 0, fontWeight: "800", fontSize: "15px", color: "#111827" }}>
          📍 {report.direccion}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#4b5563", lineHeight: "1.4" }}>
          {report.descripcion}
        </p>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "999px", backgroundColor: severity.bg, color: severity.color }}>
            {severity.label}
          </span>
          <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "999px", backgroundColor: status.bg, color: status.color }}>
            {status.label}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => onSetStatus(report.id, "en_proceso")}
          disabled={report.estado === "en_proceso"}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: report.estado === "en_proceso" ? "#e5e7eb" : "#ece5e5",
            color: report.estado === "en_proceso" ? "#9ca3af" : "#1e3a8a",
            fontSize: "13px",
            fontWeight: "700",
            cursor: report.estado === "en_proceso" ? "default" : "pointer",
          }}
        >
          En proceso
        </button>
        <button
          onClick={() => onSetStatus(report.id, "resuelto")}
          disabled={report.estado === "resuelto"}
          style={{
            padding: "10px 16px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: report.estado === "resuelto" ? "#e5e7eb" : "#dcfce7",
            color: report.estado === "resuelto" ? "#9ca3af" : "#16a34a",
            fontSize: "13px",
            fontWeight: "700",
            cursor: report.estado === "resuelto" ? "default" : "pointer",
          }}
        >
          Solucionado
        </button>
      </div>
    </div>
  );
}

export default function AlcaldiaPanel() {
  // 🏛️ Cambios de estado simulados en estado local mientras no existe el
  // endpoint real (ej. PATCH /api/huecos/:id/estado).
  const [reports, setReports] = useState(MOCK_REPORTS);

  const setStatus = (id, estado) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, estado } : r)));
  };

  const priorizados = sortByPriority(reports.filter((r) => r.prioridadJac));
  const sinPriorizar = reports.filter((r) => !r.prioridadJac);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f3f4f6", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <DemoRoleSwitcher />

      <header style={{ background: "linear-gradient(135deg, #14532d 0%, #16a34a 100%)", padding: "44px 24px 44px", color: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "rgba(255,255,255,0.18)", padding: "5px 12px", borderRadius: "999px" }}>
            PANEL ALCALDÍA
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "12px 0 0" }}>Huecos priorizados por la JAC</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.92, fontSize: "14px", maxWidth: "560px" }}>
            Ordenados de mayor a menor prioridad. Actualiza el estado a medida que avanza la reparación.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "30px 24px 60px", display: "flex", flexDirection: "column", gap: "28px" }}>
        {priorizados.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {priorizados.map((r) => (
              <AlcaldiaRow key={r.id} report={r} onSetStatus={setStatus} />
            ))}
          </div>
        ) : (
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Todavía no hay huecos priorizados por la JAC.
          </p>
        )}

        {sinPriorizar.length > 0 && (
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
              Esperando priorización de la JAC ({sinPriorizar.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", opacity: 0.55 }}>
              {sinPriorizar.map((r) => (
                <div
                  key={r.id}
                  style={{
                    backgroundColor: "white",
                    borderRadius: "14px",
                    padding: "14px 20px",
                    fontSize: "13px",
                    color: "#6b7280",
                    boxShadow: "0 4px 10px -6px rgba(15,23,42,0.15)",
                  }}
                >
                  📍 {r.direccion} — aún sin revisar
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
