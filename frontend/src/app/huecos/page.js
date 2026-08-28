"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/app/components/LogoutButton";
import { STATUS_STYLE } from "@/lib/mockHuecos";

function tiempoRelativo(fechaIso) {
  const diffMs = Date.now() - new Date(fechaIso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Hace un momento";
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias} día${dias === 1 ? "" : "s"}`;
}

function ReportCard({ report, liked, likeCount, onToggleLike }) {
  const status = STATUS_STYLE[report.estado] || STATUS_STYLE.pendiente;

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
      {/* Imagen real subida por el ciudadano */}
      <div style={{ height: "150px", position: "relative", backgroundColor: "#dbeafe" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={report.imagen_url}
          alt={`Hueco en ${report.direccion}`}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
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

        {/* Mini mapa placeholder — todavía no hay integración con proveedor de mapas */}
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
          <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
            {tiempoRelativo(report.created_at)} · {report.reportado_por}
          </p>

          {/* ❤️ Apoyar / "lo he visto también" — todavía simulado, falta la tabla de likes */}
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
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 👍 Apoyos (like) simulados en el navegador mientras no existe la tabla
  // de likes ni el endpoint real (ej. POST /api/huecos/:id/like).
  const [liked, setLiked] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/huecos`);
        if (!res.ok) throw new Error("No se pudieron cargar los reportes");

        const data = await res.json();
        setReports(data);
        // Arranca en 0: todavía no existe la tabla de likes real en el backend.
        setLikeCounts(Object.fromEntries(data.map((r) => [r.id, 0])));
      } catch (err) {
        setError("No se pudieron cargar los reportes. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [apiBaseUrl]);

  const toggleLike = (id) => {
    setLiked((prev) => {
      const isLiked = !prev[id];
      setLikeCounts((counts) => ({
        ...counts,
        [id]: (counts[id] || 0) + (isLiked ? 1 : -1),
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
          <LogoutButton />
        </div>
      </header>

      {/* Lista de reportes */}
      <section style={{ maxWidth: "1100px", margin: "-32px auto 0", padding: "0 24px 60px" }}>
        {loading && (
          <p style={{ color: "white", fontWeight: "600" }}>Cargando reportes...</p>
        )}

        {!loading && error && (
          <div style={{ backgroundColor: "white", borderRadius: "18px", padding: "24px", color: "#dc2626", fontWeight: "600" }}>
            {error}
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div style={{ backgroundColor: "white", borderRadius: "18px", padding: "24px", color: "#4b5563" }}>
            Todavía no hay huecos reportados. ¡Sé el primero en reportar uno!
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "22px",
            }}
          >
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                liked={!!liked[report.id]}
                likeCount={likeCounts[report.id] || 0}
                onToggleLike={() => toggleLike(report.id)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
