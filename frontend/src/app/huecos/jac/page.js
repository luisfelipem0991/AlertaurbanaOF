"use client";

import { useState } from "react";
import DemoRoleSwitcher from "../DemoRoleSwitcher";
import { MOCK_REPORTS, SEVERITY_STYLE, PRIORITY_STYLE, sortByPriority } from "@/lib/mockHuecos";

const PRIORITY_OPTIONS = ["alta", "media", "baja"];

function JacRow({ report, onSetPriority }) {
  const severity = SEVERITY_STYLE[report.gravedadReportada];

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
        borderLeft: report.prioridadJac
          ? `5px solid ${PRIORITY_STYLE[report.prioridadJac].color}`
          : "5px solid #e5e7eb",
      }}
    >
      <div style={{ fontSize: "28px" }}>{report.icon}</div>

      <div style={{ flex: 1, minWidth: "220px" }}>
        <p style={{ margin: 0, fontWeight: "800", fontSize: "15px", color: "#111827" }}>
          📍 {report.direccion}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#4b5563", lineHeight: "1.4" }}>
          {report.descripcion}
        </p>
        <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "4px 10px",
              borderRadius: "999px",
              backgroundColor: severity.bg,
              color: severity.color,
            }}
          >
            Reportado como {severity.label.replace("Gravedad ", "")}
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              padding: "4px 10px",
              borderRadius: "999px",
              backgroundColor: "#fee2e2",
              color: "#dc2626",
            }}
          >
            ❤️ {report.likes} apoyos
          </span>
        </div>
      </div>

      {/* Selector de prioridad oficial */}
      <div>
        <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "700", color: "#6b7280", textAlign: "center" }}>
          Prioridad JAC
        </p>
        <div style={{ display: "flex", gap: "6px" }}>
          {PRIORITY_OPTIONS.map((option) => {
            const active = report.prioridadJac === option;
            const style = PRIORITY_STYLE[option];
            return (
              <button
                key={option}
                onClick={() => onSetPriority(report.id, option)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  border: active ? `2px solid ${style.color}` : "2px solid #e5e7eb",
                  backgroundColor: active ? style.bg : "#fafafa",
                  color: active ? style.color : "#6b7280",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function JacPanel() {
  // 🧭 Prioridad asignada por la JAC, simulada en estado local mientras no
  // existe el endpoint real (ej. PATCH /api/huecos/:id/prioridad).
  const [reports, setReports] = useState(MOCK_REPORTS);

  const setPriority = (id, priority) => {
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, prioridadJac: r.prioridadJac === priority ? null : priority } : r))
    );
  };

  const sorted = sortByPriority(reports);
  const sinPriorizar = sorted.filter((r) => !r.prioridadJac);
  const priorizados = sorted.filter((r) => r.prioridadJac);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#f5f4fb", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <DemoRoleSwitcher />

      <header style={{ background: "linear-gradient(135deg, #312e81 0%, #6d28d9 100%)", padding: "44px 24px 44px", color: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", backgroundColor: "rgba(255,255,255,0.15)", padding: "5px 12px", borderRadius: "999px" }}>
            PANEL JAC
          </span>
          <h1 style={{ fontSize: "28px", fontWeight: "800", margin: "12px 0 0" }}>Priorización de huecos</h1>
          <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: "14px", maxWidth: "560px" }}>
            Revisa cada reporte y asígnale una prioridad según qué tan peligroso es realmente.
            Los apoyos de la comunidad (❤️) son una señal, pero la decisión final es tuya.
          </p>
        </div>
      </header>

      <section style={{ maxWidth: "1000px", margin: "0 auto", padding: "30px 24px 60px", display: "flex", flexDirection: "column", gap: "28px" }}>
        {sinPriorizar.length > 0 && (
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
              Pendientes por revisar ({sinPriorizar.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {sinPriorizar.map((r) => (
                <JacRow key={r.id} report={r} onSetPriority={setPriority} />
              ))}
            </div>
          </div>
        )}

        {priorizados.length > 0 && (
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "12px" }}>
              Ya priorizados ({priorizados.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {priorizados.map((r) => (
                <JacRow key={r.id} report={r} onSetPriority={setPriority} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
