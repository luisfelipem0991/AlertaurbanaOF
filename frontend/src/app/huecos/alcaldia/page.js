"use client";

import { useState, useEffect } from "react";
import LogoutButton from "@/app/components/LogoutButton";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

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
  const [timeFilter, setTimeFilter] = useState("todo"); // "mensual", "anual", "todo"

  const [selectedReport, setSelectedReport] = useState(null);

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

  // Lógica de Estadísticas
  const getFilteredReportsForStats = () => {
    const now = new Date();
    return reportesAlcaldia.filter((r) => {
      if (timeFilter === "todo") return true;
      const reportDate = new Date(r.created_at || Date.now());
      if (timeFilter === "mensual") {
        return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
      }
      if (timeFilter === "anual") {
        return reportDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  };

  const statsReports = getFilteredReportsForStats();

  // Data for Pie Chart (Priorities)
  const priorityCount = { alta: 0, media: 0, baja: 0 };
  statsReports.forEach(r => {
    if (r.prioridad && priorityCount[r.prioridad] !== undefined) {
      priorityCount[r.prioridad]++;
    }
  });
  const pieData = [
    { name: 'Alta', value: priorityCount.alta, color: '#ef4444' }, // red-500
    { name: 'Media', value: priorityCount.media, color: '#f97316' }, // orange-500
    { name: 'Baja', value: priorityCount.baja, color: '#22c55e' } // green-500
  ];

  // Data for Bar Chart (Status)
  const statusCount = { pendiente: 0, en_proceso: 0, resuelto: 0 };
  statsReports.forEach(r => {
    const s = r.estado || 'pendiente';
    if (statusCount[s] !== undefined) statusCount[s]++;
  });
  const barData = [
    { name: 'Por Iniciar', count: statusCount.pendiente },
    { name: 'En Ejecución', count: statusCount.en_proceso },
    { name: 'Finalizados', count: statusCount.resuelto }
  ];

  const totalReparados = statusCount.resuelto;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      
      {/* HEADER */}
      <header className="relative bg-white dark:bg-slate-900 pt-10 pb-12 px-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 overflow-hidden">
        {/* Background Patterns and Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 dark:from-slate-950 via-white dark:via-slate-900 to-amber-50 dark:to-slate-950 opacity-100 transition-colors duration-300"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-orange-400/20 dark:bg-orange-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full border border-orange-200 dark:border-orange-500/20 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              OBRAS PÚBLICAS (ALCALDÍA)
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Tablero de Ejecución
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Gestiona el estado de reparación de los huecos priorizados por la JAC. Mueve los reportes a "En Ejecución" y finalmente a "Finalizados".
            </p>
          </div>
          <div className="flex-shrink-0">
            <LogoutButton className="px-5 py-2.5 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 text-slate-800 dark:text-white font-bold text-sm shadow-[0_4px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-white hover:shadow-[0_4px_25px_rgba(249,115,22,0.15)] dark:hover:bg-white/20 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300" />
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL CON SIDEBAR */}
      <section className="max-w-6xl mx-auto px-6 py-8 relative z-20 flex flex-col md:flex-row gap-8">
        
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

          <button 
            onClick={() => setActiveTab("estadisticas")}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === "estadisticas" ? "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${activeTab === "estadisticas" ? "bg-purple-500" : "bg-slate-300 dark:bg-slate-600"}`}></span>
              Estadísticas
            </div>
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
                      {resueltos.map(r => <KanbanCard key={r.id} report={r} onClick={() => setSelectedReport(r)} />)}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 border-dashed">
                      <p className="text-slate-500 dark:text-slate-400">No hay obras terminadas registradas.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB ESTADÍSTICAS */}
              {activeTab === "estadisticas" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h2 className="text-xl font-extrabold text-slate-800 dark:text-white">Reporte de Avance</h2>
                    
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                      <button 
                        onClick={() => setTimeFilter("mensual")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${timeFilter === "mensual" ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                      >
                        Este Mes
                      </button>
                      <button 
                        onClick={() => setTimeFilter("anual")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${timeFilter === "anual" ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                      >
                        Este Año
                      </button>
                      <button 
                        onClick={() => setTimeFilter("todo")}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${timeFilter === "todo" ? "bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                      >
                        Histórico
                      </button>
                    </div>
                  </div>

                  {statsReports.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 border-dashed">
                      <p className="text-slate-500 dark:text-slate-400">No hay datos en el periodo seleccionado.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Summary Card */}
                      <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl p-6 text-white shadow-lg flex items-center justify-between">
                        <div>
                          <p className="text-emerald-100 font-medium mb-1">Obras Finalizadas (Reparadas)</p>
                          <h3 className="text-4xl font-extrabold">{totalReparados}</h3>
                        </div>
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
                          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                      </div>

                      {/* Pie Chart (Priorities) */}
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 self-start">Prioridades Asignadas por JAC</h3>
                        <div className="w-full h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              {/* Sombra para que se vea más 3D/moderno */}
                              <defs>
                                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
                                </filter>
                              </defs>
                              <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={0}
                                outerRadius={85}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="none"
                                cornerRadius={0}
                                filter="url(#shadow)"
                              >
                                {pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                              />
                              <Legend 
                                verticalAlign="bottom" 
                                height={36} 
                                iconType="circle"
                                formatter={(value) => <span className="text-slate-600 dark:text-slate-300 font-bold ml-1">{value}</span>}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Bar Chart (Status) */}
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-6 self-start">Estado de Ejecución (Alcaldía)</h3>
                        <div className="w-full h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                              <RechartsTooltip 
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              />
                              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                                {
                                  barData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={
                                      entry.name === 'Por Iniciar' ? '#94a3b8' :
                                      entry.name === 'En Ejecución' ? '#3b82f6' : '#22c55e'
                                    } />
                                  ))
                                }
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

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
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
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
            <div className="p-6 overflow-y-auto flex-1 flex flex-col md:flex-row gap-6">
              
              {/* Info y Foto */}
              <div className="flex-1 space-y-4">
                {selectedReport.imagen_url ? (
                  <div className="w-full h-48 md:h-64 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden relative border border-slate-200 dark:border-slate-700">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedReport.imagen_url} alt="Hueco" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-48 md:h-64 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <span className="text-4xl">📸</span>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ubicación</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{selectedReport.direccion}</p>
                </div>
                
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción de la comunidad</p>
                  <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-sm leading-relaxed">
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
    alta: "bg-red-500 text-white",
    media: "bg-orange-500 text-white",
    baja: "bg-green-500 text-white",
  };

  const pColor = prioridadColors[report.prioridad] || prioridadColors.baja;

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-none hover:shadow-2xl dark:hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col border border-slate-200 dark:border-slate-700 relative group cursor-pointer"
    >
      {/* Imagen real subida por el ciudadano */}
      <div className="h-40 relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={report.imagen_url || "https://via.placeholder.com/400x300?text=Sin+Imagen"}
          alt={`Hueco en ${report.direccion}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className={`absolute top-3 right-3 shrink-0 text-xs font-bold px-3 py-1.5 rounded-full capitalize shadow-md ${pColor}`}>
          Prioridad {report.prioridad}
        </span>
        <span className="absolute top-3 left-3 bg-black/50 text-white backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold">
          #{report.id}
        </span>
      </div>
      
      {/* Contenido */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <h3 className="m-0 font-extrabold text-[15px] text-slate-900 dark:text-white line-clamp-1 transition-colors">
          📍 {report.direccion}
        </h3>
        <p className="mt-1 text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 transition-colors">
          {report.descripcion}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
          <span className="text-xs font-semibold text-slate-400">
            Hace {new Date(report.created_at || Date.now()).toLocaleDateString()}
          </span>
          <button className="text-orange-500 dark:text-orange-400 text-sm font-bold hover:underline flex items-center gap-1">
            Ver detalles 
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
