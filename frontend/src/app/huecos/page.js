"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/app/components/LogoutButton";
import { STATUS_STYLE } from "@/lib/mockHuecos";

function tiempoRelativo(fechaIso) {
  if (!fechaIso) return "Hace un momento";
  const diffMs = Date.now() - new Date(fechaIso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Hace un momento";
  if (min < 60) return `Hace ${min} min`;
  const horas = Math.floor(min / 60);
  if (horas < 24) return `Hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `Hace ${dias} día${dias === 1 ? "" : "s"}`;
}

function ReportCard({ report, liked, likeCount, onToggleLike, onVerMas }) {
  const status = STATUS_STYLE[report.estado] || STATUS_STYLE.pendiente;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-none hover:shadow-2xl dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:-translate-y-2 transition-all duration-300 flex flex-col border border-slate-100 dark:border-slate-700 relative group cursor-pointer">
      {/* Imagen real subida por el ciudadano */}
      <div className="h-48 relative bg-orange-50 dark:bg-slate-900 overflow-hidden" onClick={() => onVerMas(report)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={report.imagen_url || "https://via.placeholder.com/400x300?text=Sin+Imagen"}
          alt={`Hueco en ${report.direccion}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span
          className="absolute top-3 right-3 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm"
          style={{
            backgroundColor: status.bg,
            color: status.color,
          }}
        >
          {status.label}
        </span>
      </div>

      {/* Contenido */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div onClick={() => onVerMas(report)}>
          <h3 className="m-0 font-extrabold text-[15px] text-slate-900 dark:text-white line-clamp-1 transition-colors">
            📍 {report.direccion}
          </h3>
          <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 transition-colors">
            {report.descripcion}
          </p>
        </div>

        <div className="mt-auto pt-3 flex flex-col gap-3">
          <button
            onClick={() => onVerMas(report)}
            className="w-full bg-slate-50 dark:bg-slate-700 hover:bg-orange-50 dark:hover:bg-slate-600 text-orange-600 dark:text-orange-400 font-bold text-sm py-2 rounded-xl transition-colors border border-slate-200 dark:border-slate-600 hover:border-orange-200 dark:hover:border-orange-500/50"
          >
            Ver más detalles y mapa
          </button>

          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
            <p className="m-0 text-xs text-slate-400 font-medium truncate">
              {tiempoRelativo(report.created_at)}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLike();
              }}
              className={`flex items-center gap-1.5 border-2 rounded-full px-3 py-1 text-xs font-bold cursor-pointer transition-colors ${
                liked
                  ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400"
                  : "border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600"
              }`}
            >
              <span>{liked ? "🧡" : "🤍"}</span>
              {likeCount}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReportesPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const [liked, setLiked] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  // Cargar preferencia de tema de localStorage al inicio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/huecos`);
        if (!res.ok) throw new Error("No se pudieron cargar los reportes");

        const data = await res.json();
        setReports(data);
        setLikeCounts(Object.fromEntries(data.map((r) => [r.id, r.likes_count || 0])));

        // Intentar cargar los likes del usuario si está logueado
        try {
          const likesRes = await fetch(`${apiBaseUrl}/api/huecos/likes/me`, {
            credentials: "include"
          });
          if (likesRes.ok) {
            const likedIds = await likesRes.json();
            const likedMap = {};
            likedIds.forEach(id => likedMap[id] = true);
            setLiked(likedMap);
          }
        } catch (e) {
          console.warn("No se pudieron cargar los likes (usuario quizás no logueado)");
        }
      } catch (err) {
        setError("No se pudieron cargar los reportes. Intenta de nuevo más tarde.");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [apiBaseUrl]);

  const toggleLike = async (id) => {
    // Actualización optimista de 1 en 1 sin depender de 'prev' para evitar bugs de React Strict Mode
    const isCurrentlyLiked = liked[id];
    const currentCount = likeCounts[id] || 0;
    
    setLiked({ ...liked, [id]: !isCurrentlyLiked });
    setLikeCounts({ ...likeCounts, [id]: currentCount + (!isCurrentlyLiked ? 1 : -1) });

    try {
      const res = await fetch(`${apiBaseUrl}/api/huecos/${id}/like`, {
        method: "POST",
        credentials: "include"
      });
      
      if (!res.ok) throw new Error("Error al guardar el apoyo");
      
      const data = await res.json();
      // Sincronizar exactamente con lo que el backend dice
      setLikeCounts({ ...likeCounts, [id]: data.likesCount });
      setLiked({ ...liked, [id]: data.liked });
    } catch (e) {
      console.warn("Error toggling like, revertiendo cambios", e);
      // Revertir en caso de error
      setLiked({ ...liked, [id]: isCurrentlyLiked });
      setLikeCounts({ ...likeCounts, [id]: currentCount });
      alert("Inicia sesión para poder apoyar un reporte.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300">
      {/* Header Moderno con colores de la landing (Naranja/Ámbar/Slate) */}
      <header className="relative pt-16 pb-28 px-6 overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        {/* Background Patterns and Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 dark:from-slate-950 via-white dark:via-slate-900 to-amber-50 dark:to-slate-950 opacity-100 transition-colors duration-300"></div>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          {/* Glowing orbs */}
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-orange-400/20 dark:bg-orange-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[60%] bg-amber-400/20 dark:bg-amber-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="md:w-2/3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 dark:bg-orange-500/20 border border-orange-400/20 dark:border-orange-500/30 text-orange-700 dark:text-orange-400 text-xs font-bold mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]"></span>
              Alerta Urbana Activa
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-5 leading-tight transition-colors duration-300">
              Construyamos juntos <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400">
                calles más seguras
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-xl text-base md:text-lg leading-relaxed font-medium mx-auto md:mx-0 transition-colors duration-300">
              ¡Tu voz transforma nuestra ciudad! Reporta los huecos de tu barrio y apoya los reportes de tus vecinos. Cada alerta es un paso más hacia la ciudad que merecemos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 md:w-1/3 justify-end w-full mt-4 md:mt-0">
            <Link
              href="/huecos/reportar"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_25px_rgba(249,115,22,0.5)] hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
              Reportar un hueco
            </Link>
            <div className="w-full sm:w-auto bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-xl backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors duration-300 flex justify-center text-slate-800 dark:text-white">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Lista de reportes */}
      <section className="max-w-6xl mx-auto px-6 py-8 -mt-12 relative z-20">
        {loading && (
          <div className="flex justify-center p-12 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
            <div className="w-12 h-12 border-4 border-orange-200 dark:border-orange-900 border-t-orange-500 dark:border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 text-center text-red-500 font-bold shadow-sm border border-red-100 dark:border-red-900/50 transition-colors">
            {error}
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700 border-dashed transition-colors">
            <div className="text-4xl mb-4">🛣️</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Todo limpio</h3>
            <p className="mt-2">Todavía no hay huecos reportados. ¡Sé el primero en reportar uno!</p>
          </div>
        )}

        {!loading && !error && reports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {reports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                liked={!!liked[report.id]}
                likeCount={likeCounts[report.id] || 0}
                onToggleLike={() => toggleLike(report.id)}
                onVerMas={setSelectedReport}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal de Detalle y Mapa */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 transition-colors">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Detalle del Reporte
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
              {/* Info y Foto */}
              <div className="flex-1 space-y-4">
                <div className="w-full h-48 md:h-64 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedReport.imagen_url || "https://via.placeholder.com/600x400?text=Sin+Imagen"}
                    alt="Hueco"
                    className="w-full h-full object-cover"
                  />
                  <span
                    className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full shadow-md"
                    style={{
                      backgroundColor: (STATUS_STYLE[selectedReport.estado] || STATUS_STYLE.pendiente).bg,
                      color: (STATUS_STYLE[selectedReport.estado] || STATUS_STYLE.pendiente).color,
                    }}
                  >
                    {(STATUS_STYLE[selectedReport.estado] || STATUS_STYLE.pendiente).label}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ubicación Reportada</p>
                  <p className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedReport.direccion}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción</p>
                  <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-sm leading-relaxed">
                    {selectedReport.descripcion}
                  </p>
                </div>
              </div>

              {/* Mapa de Google */}
              <div className="flex-1 flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ubicación en el Mapa</p>
                <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 min-h-[300px]">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://www.google.com/maps?q=${encodeURIComponent(selectedReport.direccion + ", Medellín, Colombia")}&output=embed`}
                  ></iframe>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Reportado por: <span className="font-bold text-slate-700 dark:text-slate-300">{selectedReport.reportado_por || "Ciudadano"}</span>
              </span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {tiempoRelativo(selectedReport.created_at)}
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
