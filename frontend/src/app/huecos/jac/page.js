"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/app/components/LogoutButton";

// Estilos base para UI
const PRIORITY_OPTIONS = ["alta", "media", "baja"];

const PRIORITY_STYLE = {
  alta: { label: "Alta", color: "text-purple-700", bg: "bg-purple-100", border: "border-purple-200" },
  media: { label: "Media", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  baja: { label: "Baja", color: "text-purple-700", bg: "bg-slate-50", border: "border-slate-200" },
};

export default function JacPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeTab, setActiveTab] = useState("pendientes");

  // Cargar reportes desde la DB real (Backend Express)
  useEffect(() => {
    async function fetchReports() {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiBaseUrl}/api/huecos`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          setReports(data);
        } else {
          console.error("No se pudieron cargar los reportes");
        }
      } catch (error) {
        console.error("Error al hacer fetch a la API", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleApprove = async (id, prioridad) => {
    // Actualización optimista de la UI
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, prioridad } : r))
    );
    // Cierra el modal si estaba abierto aprobando desde ahí
    if (selectedReport?.id === id) {
      setSelectedReport({ ...selectedReport, prioridad });
    }

    try {
      // Llamada al backend real de Express
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiBaseUrl}/api/huecos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prioridad }),
      });
      if (!res.ok) {
        console.warn("Fallo al actualizar en el backend Express.");
      }
    } catch (error) {
      console.error("Error al actualizar la prioridad", error);
    }
  };

  const pendingReports = reports.filter((r) => !r.prioridad);
  const approvedReports = reports.filter((r) => r.prioridad && r.prioridad !== "descartado");
  const discardedReports = reports.filter((r) => r.prioridad === "descartado");

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      
      {/* HEADER */}
      <header className="bg-gradient-to-r from-indigo-900 to-purple-800 pt-12 pb-16 px-6 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full tracking-wider backdrop-blur-sm border border-white/10 mb-4">
              PANEL JAC
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Gestión de Reportes
            </h1>
            <p className="text-indigo-100 mt-3 max-w-lg text-sm md:text-base leading-relaxed">
              Revisa los reportes de la comunidad, asígnales una prioridad y apruébalos para enviarlos directamente a la mesa de trabajo de la Alcaldía.
            </p>
          </div>
          <div className="flex-shrink-0 bg-white/10 p-1.5 rounded-2xl backdrop-blur-sm border border-white/10">
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL CON SIDEBAR */}
      <section className="max-w-6xl mx-auto px-6 py-8 -mt-8 relative z-20 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR DE NAVEGACIÓN */}
        <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-row md:flex-col gap-2 overflow-x-auto self-start">
          <button 
            onClick={() => setActiveTab("pendientes")}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === "pendientes" ? "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "pendientes" ? "bg-orange-500" : "bg-slate-300 dark:bg-slate-600"}`}></span>
              Pendientes
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === "pendientes" ? "bg-orange-100 dark:bg-orange-500/20" : "bg-slate-100 dark:bg-slate-700"}`}>
              {pendingReports.length}
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab("aprobados")}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === "aprobados" ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "aprobados" ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}></span>
              Aprobados
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === "aprobados" ? "bg-green-100 dark:bg-green-500/20" : "bg-slate-100 dark:bg-slate-700"}`}>
              {approvedReports.length}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab("descartados")}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === "descartados" ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "descartados" ? "bg-red-500" : "bg-slate-300 dark:bg-slate-600"}`}></span>
              Descartados
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === "descartados" ? "bg-red-100 dark:bg-red-500/20" : "bg-slate-100 dark:bg-slate-700"}`}>
              {discardedReports.length}
            </span>
          </button>
        </aside>

        {/* ÁREA DE LISTADO DE REPORTES */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 font-medium">Cargando reportes de la base de datos...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              
              {/* TAB PENDIENTES */}
              {activeTab === "pendientes" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
                      Pendientes de Aprobación
                    </h2>
                  </div>
                  {pendingReports.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {pendingReports.map((report) => (
                        <ReportCard 
                          key={report.id} 
                          report={report} 
                          onClick={() => setSelectedReport(report)} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 border-dashed">
                      <div className="text-4xl mb-4">🎉</div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Todo al día</h3>
                      <p className="text-slate-500 dark:text-slate-400 mt-2">No hay reportes pendientes por revisar. ¡Gran trabajo!</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB APROBADOS */}
              {activeTab === "aprobados" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
                      Enviados a la Alcaldía
                    </h2>
                  </div>
                  {approvedReports.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {approvedReports.map((report) => (
                        <ReportCard 
                          key={report.id} 
                          report={report} 
                          isApproved 
                          onClick={() => setSelectedReport(report)} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 border-dashed">
                      <p className="text-slate-500 dark:text-slate-400">Aún no has aprobado ningún reporte.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB DESCARTADOS */}
              {activeTab === "descartados" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">
                      Reportes Descartados
                    </h2>
                  </div>
                  {discardedReports.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {discardedReports.map((report) => (
                        <ReportCard 
                          key={report.id} 
                          report={report} 
                          isDiscarded
                          onClick={() => setSelectedReport(report)} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 border-dashed">
                      <p className="text-slate-500 dark:text-slate-400">No tienes reportes descartados.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}
        </div>
      </section>

      {/* MODAL DE DETALLES DEL REPORTE */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Detalle del Reporte #{selectedReport.id}
              </h3>
              <button 
                onClick={() => setSelectedReport(null)}
                className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {selectedReport.imagen_url ? (
                <div className="w-full h-64 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6 overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedReport.imagen_url} alt="Hueco" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-full h-32 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                  <span className="text-4xl">📸</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ubicación</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedReport.direccion}</p>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción de la comunidad</p>
                  <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    {selectedReport.descripcion}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
              {selectedReport.prioridad === "descartado" ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-between">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 px-4 py-2 rounded-xl font-bold w-full sm:w-auto justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Reporte Descartado
                  </div>
                  <button
                    onClick={() => handleApprove(selectedReport.id, null)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-slate-500 hover:text-slate-700 dark:text-slate-300 rounded-lg text-sm font-bold transition-all shadow-sm hover:shadow flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    Restaurar a Pendientes
                  </button>
                </div>
              ) : selectedReport.prioridad ? (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-500/10 px-4 py-2 rounded-xl font-bold w-full sm:w-auto justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Aprobado y enviado a Alcaldía
                </div>
              ) : (
                <>
                  <div className="w-full sm:w-auto">
                    <p className="text-xs font-bold text-slate-500 mb-2 uppercase text-center sm:text-left">Asignar Prioridad para Aprobar</p>
                    <div className="flex flex-wrap gap-2 w-full justify-center sm:justify-start">
                      {PRIORITY_OPTIONS.map((p) => (
                        <button
                          key={p}
                          onClick={() => handleApprove(selectedReport.id, p)}
                          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:text-indigo-600 dark:text-slate-300 rounded-lg text-sm font-bold capitalize transition-all shadow-sm hover:shadow"
                        >
                          {p}
                        </button>
                      ))}
                      <div className="w-[1px] h-auto bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
                      <button
                        onClick={() => handleApprove(selectedReport.id, "descartado")}
                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 hover:bg-red-50 hover:border-red-500 hover:text-red-600 dark:hover:bg-red-900/20 text-red-500 rounded-lg text-sm font-bold capitalize transition-all shadow-sm hover:shadow flex items-center gap-1.5"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Descartar
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </main>
  );
}

// Subcomponente de Tarjeta
function ReportCard({ report, isApproved, isDiscarded, onClick }) {
  let borderColor = 'border-l-orange-500';
  if (isApproved) borderColor = 'border-l-green-500';
  if (isDiscarded) borderColor = 'border-l-red-500';

  return (
    <div 
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-2xl p-5 cursor-pointer transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-indigo-500/50 flex flex-col gap-3 border-l-4 ${borderColor}`}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">{report.direccion}</h3>
        {isApproved && (
          <span className="shrink-0 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-1 rounded-md capitalize">
            {report.prioridad}
          </span>
        )}
        {isDiscarded && (
          <span className="shrink-0 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 text-xs font-bold px-2 py-1 rounded-md capitalize">
            Descartado
          </span>
        )}
      </div>
      
      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
        {report.descripcion}
      </p>

      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
        <span className="text-xs font-semibold text-slate-400">
          Hace {new Date(report.created_at || Date.now()).toLocaleDateString()}
        </span>
        <button className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline flex items-center gap-1">
          Ver detalles 
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
