"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/app/components/LogoutButton";

const PRIORITY_ORDER = { alta: 0, media: 1, baja: 2 };

// Helper para ordenar por prioridad
function sortByPriority(reports) {
  return [...reports].sort((a, b) => {
    const aOrder = a.prioridad ? PRIORITY_ORDER[a.prioridad] : 99;
    const bOrder = b.prioridad ? PRIORITY_ORDER[b.prioridad] : 99;
    return aOrder - bOrder;
  });
}

export default function AlcaldiaPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pendientes");

  const [selectedReport, setSelectedReport] = useState(null);

  // Fetch real data
  useEffect(() => {
    async function fetchReports() {
      try {
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${apiBaseUrl}/api/huecos`, { credentials: "include" });
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

  const handleSetStatus = async (id, estado) => {
    // Optimistic Update
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, estado } : r))
    );

    if (selectedReport?.id === id) {
      setSelectedReport({ ...selectedReport, estado });
    }

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiBaseUrl}/api/huecos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ estado }),
      });
      if (!res.ok) {
        console.warn("Fallo al actualizar en el backend Express.");
      }
    } catch (error) {
      console.error("Error al actualizar el estado", error);
    }
  };

  // Filtrado de reportes (Solo vemos los que la JAC aprobo, descartando nulos o 'descartado')
  const reportesAlcaldia = reports.filter(r => r.prioridad && r.prioridad !== "descartado");

  // Agrupamiento por estado
  const pendientes = sortByPriority(reportesAlcaldia.filter(r => r.estado === "pendiente" || !r.estado));
  const enProceso = sortByPriority(reportesAlcaldia.filter(r => r.estado === "en_proceso"));
  const resueltos = sortByPriority(reportesAlcaldia.filter(r => r.estado === "resuelto"));

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      
      {/* HEADER */}
      <header className="bg-gradient-to-r from-emerald-900 to-green-700 pt-12 pb-16 px-6 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-green-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 text-white text-xs font-bold rounded-full tracking-wider backdrop-blur-sm border border-white/10 mb-4">
              OBRAS PÚBLICAS (ALCALDÍA)
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Tablero de Ejecución
            </h1>
            <p className="text-emerald-100 mt-3 max-w-lg text-sm md:text-base leading-relaxed">
              Gestiona el estado de reparación de los huecos priorizados por la JAC. Mueve los reportes a "En Ejecución" y finalmente a "Finalizados".
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
            className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === "pendientes" ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "pendientes" ? "bg-slate-500" : "bg-slate-300 dark:bg-slate-600"}`}></span>
              Por Iniciar
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === "pendientes" ? "bg-slate-200 dark:bg-slate-600" : "bg-slate-100 dark:bg-slate-700"}`}>
              {pendientes.length}
            </span>
          </button>
          
          <button 
            onClick={() => setActiveTab("en_proceso")}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === "en_proceso" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "en_proceso" ? "bg-blue-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"}`}></span>
              En Ejecución
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === "en_proceso" ? "bg-blue-100 dark:bg-blue-500/20" : "bg-slate-100 dark:bg-slate-700"}`}>
              {enProceso.length}
            </span>
          </button>

          <button 
            onClick={() => setActiveTab("resueltos")}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === "resueltos" ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "resueltos" ? "bg-green-500" : "bg-slate-300 dark:bg-slate-600"}`}></span>
              Finalizados
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-xs ${activeTab === "resueltos" ? "bg-green-100 dark:bg-green-500/20" : "bg-slate-100 dark:bg-slate-700"}`}>
              {resueltos.length}
            </span>
          </button>
        </aside>

        {/* ÁREA DE LISTADO DE REPORTES */}
        <div className="flex-1 w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 font-medium">Cargando tablero de ejecución...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              
              {/* TAB PENDIENTES */}
              {activeTab === "pendientes" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Obras Por Iniciar</h2>
                  </div>
                  {pendientes.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {pendientes.map(r => <KanbanCard key={r.id} report={r} onClick={() => setSelectedReport(r)} onStatusChange={handleSetStatus} />)}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 border-dashed">
                      <p className="text-slate-500 dark:text-slate-400">No hay obras pendientes por iniciar.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB EN PROCESO */}
              {activeTab === "en_proceso" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Obras En Ejecución</h2>
                  </div>
                  {enProceso.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {enProceso.map(r => <KanbanCard key={r.id} report={r} onClick={() => setSelectedReport(r)} onStatusChange={handleSetStatus} />)}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 border-dashed">
                      <p className="text-slate-500 dark:text-slate-400">Sin obras en ejecución actualmente.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB RESUELTOS */}
              {activeTab === "resueltos" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Obras Finalizadas</h2>
                  </div>
                  {resueltos.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {resueltos.map(r => <KanbanCard key={r.id} report={r} onClick={() => setSelectedReport(r)} onStatusChange={handleSetStatus} />)}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 border-dashed">
                      <p className="text-slate-500 dark:text-slate-400">No hay obras terminadas registradas.</p>
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Reporte #{selectedReport.id}
                <span className={`text-[10px] uppercase font-extrabold px-2 py-1 rounded-md tracking-wider ${
                  selectedReport.prioridad === 'alta' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                  selectedReport.prioridad === 'media' ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                  "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                }`}>
                  Prioridad {selectedReport.prioridad}
                </span>
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
                <div className="w-full h-64 bg-slate-100 dark:bg-slate-900 rounded-2xl mb-6 overflow-hidden relative border border-slate-200 dark:border-slate-700">
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

            {/* Modal Footer (Controls) */}
            <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-3 items-center justify-end">
              {(!selectedReport.estado || selectedReport.estado === "pendiente") && (
                <button
                  onClick={() => handleSetStatus(selectedReport.id, "en_proceso")}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Iniciar Obra
                </button>
              )}
              
              {selectedReport.estado === "en_proceso" && (
                <>
                  <button
                    onClick={() => handleSetStatus(selectedReport.id, "pendiente")}
                    className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl transition-colors"
                  >
                    Devolver a Por Iniciar
                  </button>
                  <button
                    onClick={() => handleSetStatus(selectedReport.id, "resuelto")}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                  >
                    Marcar Obra como Lista
                  </button>
                </>
              )}

              {selectedReport.estado === "resuelto" && (
                <button
                  onClick={() => handleSetStatus(selectedReport.id, "en_proceso")}
                  className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Reabrir caso
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

// Subcomponente de Tarjeta Kanban
function KanbanCard({ report, onClick }) {
  const prioridadColors = {
    alta: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    media: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    baja: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  };

  const pColor = prioridadColors[report.prioridad] || prioridadColors.baja;

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col gap-3 group hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start gap-2">
        <span className={`text-[10px] uppercase font-extrabold px-2 py-1 rounded-md tracking-wider ${pColor}`}>
          Prioridad {report.prioridad}
        </span>
        <span className="text-xs text-slate-400 font-medium">
          #{report.id}
        </span>
      </div>
      
      <div>
        <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-tight">
          {report.direccion}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
          {report.descripcion}
        </p>
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
        <span className="text-[10px] font-semibold text-slate-400">
          Hace {new Date(report.created_at || Date.now()).toLocaleDateString()}
        </span>
        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1 group-hover:underline">
          Ver detalles 
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </span>
      </div>
    </div>
  );
}
