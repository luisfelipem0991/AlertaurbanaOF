"use client";

import Link from "next/link";
import { useState } from "react";
import DemoRoleSwitcher from "./DemoRoleSwitcher";
import { MOCK_REPORTS, STATUS_STYLE } from "@/lib/mockHuecos";

function ReportCard({ report, liked, likeCount, onToggleLike }) {
  const status = STATUS_STYLE[report.estado];

  return (
    <div
      style={{
        backgroundColor: "white",
        borderRadius: "22px",
        overflow: "hidden",
        boxShadow: "0 10px 25px -8px rgba(15, 23, 42, 0.18)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Imagen (placeholder) */}
      <div
        style={{
          height: "150px",
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "44px",
          position: "relative",
        }}
      >
        {report.icon}
        <span
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            fontSize: "11px",
            fontWeight: "700",
            padding: "5px 10px",
            borderRadius: "999px",
            backgroundColor: status.bg,
            color: status.color,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Contenido */}
      <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
        <p style={{ margin: 0, fontWeight: "800", fontSize: "15px", color: "#111827" }}>
          📍 {report.direccion}
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: "#4b5563", lineHeight: "1.5" }}>
          {report.descripcion}
        </p>

        {/* Mini mapa placeholder */}
        <div
          style={{
            height: "70px",
            borderRadius: "12px",
            background:
              "repeating-linear-gradient(45deg, #eef1f5, #eef1f5 8px, #e5e9f0 8px, #e5e9f0 16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "#6b7280",
            fontWeight: "600",
            border: "1px solid #e5e7eb",
          }}
        >
          🗺️ Mapa próximamente
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
          <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>{report.fecha}</p>

          {/* ❤️ Apoyar / "lo he visto también" */}
          <button
            onClick={onToggleLike}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              border: liked ? "2px solid #dc2626" : "2px solid #e5e7eb",
              backgroundColor: liked ? "#fee2e2" : "#fafafa",
              color: liked ? "#dc2626" : "#4b5563",
              borderRadius: "999px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "0.15s",
            }}
          >
            <span>{liked ? "❤️" : "🤍"}</span>
            {likeCount}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ReportesPage() {
  // 👍 Estado local de "apoyos" (like) por reporte, simulado mientras no
  // existe el endpoint real (ej. POST /api/huecos/:id/like).
  const [liked, setLiked] = useState({});
  const [likeCounts, setLikeCounts] = useState(
    Object.fromEntries(MOCK_REPORTS.map((r) => [r.id, r.likes]))
  );

  const toggleLike = (id) => {
    setLiked((prev) => {
      const isLiked = !prev[id];
      setLikeCounts((counts) => ({
        ...counts,
        [id]: counts[id] + (isLiked ? 1 : -1),
      }));
      return { ...prev, [id]: isLiked };
    });
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <DemoRoleSwitcher />

      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
          padding: "44px 24px 60px",
          color: "white",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "30px", fontWeight: "800", margin: 0 }}>Reportes ciudadanos</h1>
            <p style={{ margin: "8px 0 0", opacity: 0.9, fontSize: "14px", maxWidth: "460px" }}>
              Así van los huecos reportados por la comunidad. Dale apoyo a los que también hayas visto.
            </p>
          </div>

          <Link
            href="/huecos/reportar"
            style={{
              backgroundColor: "white",
              color: "#1e3a8a",
              padding: "14px 26px",
              borderRadius: "14px",
              fontWeight: "800",
              fontSize: "15px",
              textDecoration: "none",
              boxShadow: "0 10px 25px -8px rgba(0,0,0,0.35)",
              whiteSpace: "nowrap",
            }}
          >
            + Reportar un hueco
          </Link>
        </div>
      </header>

      {/* Lista de reportes */}
      <section style={{ maxWidth: "1100px", margin: "-32px auto 0", padding: "0 24px 60px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "22px",
          }}
        >
          {MOCK_REPORTS.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              liked={!!liked[report.id]}
              likeCount={likeCounts[report.id]}
              onToggleLike={() => toggleLike(report.id)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
