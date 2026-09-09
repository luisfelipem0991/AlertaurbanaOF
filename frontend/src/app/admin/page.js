"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/app/components/LogoutButton";
import Swal from "sweetalert2";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [huecos, setHuecos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para búsqueda y filtrado de usuarios
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");

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
    fetchUsers();
    fetchHuecos();
  }, []);

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/users`, { credentials: "include" });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHuecos = async () => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/huecos`, { credentials: "include" });
      const data = await res.json();
      setHuecos(data);
    } catch (error) {
      console.log(error);
    }
  };

  // ❌ ELIMINAR USUARIO (Manteniendo funcionalidad original)
  const deleteUser = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        popup: 'bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6',
        title: 'text-2xl font-extrabold text-slate-900 dark:text-white',
        htmlContainer: 'text-slate-500 dark:text-slate-400 text-sm mt-2',
        confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md mx-2',
        cancelButton: 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-2 px-6 rounded-xl transition-all mx-2'
      }
    });

    if (result.isConfirmed) {
      await fetch(`${apiBaseUrl}/api/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchUsers();
    }
  };

  // ♻️ CAMBIAR ROL
  const handleRoleChange = async (userId, newRole, userName) => {
    const result = await Swal.fire({
      title: '¿Cambiar rol?',
      text: `¿Estás seguro de cambiar el rol de ${userName} a ${newRole}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      buttonsStyling: false,
      customClass: {
        popup: 'bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6',
        title: 'text-2xl font-extrabold text-slate-900 dark:text-white',
        htmlContainer: 'text-slate-500 dark:text-slate-400 text-sm mt-2',
        confirmButton: 'bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md mx-2',
        cancelButton: 'bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold py-2 px-6 rounded-xl transition-all mx-2'
      }
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${apiBaseUrl}/api/users/${userId}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        });

        if (res.ok) {
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: `El rol ha sido cambiado exitosamente.`,
            buttonsStyling: false,
            customClass: {
              popup: 'bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6',
              title: 'text-2xl font-extrabold text-slate-900 dark:text-white',
              htmlContainer: 'text-slate-500 dark:text-slate-400 text-sm mt-2',
              confirmButton: 'bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md'
            }
          });
          setUsers((prev) => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } else {
          const data = await res.json();
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: data.error || 'No se pudo cambiar el rol.',
            buttonsStyling: false,
            customClass: {
              popup: 'bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 p-6',
              title: 'text-2xl font-extrabold text-slate-900 dark:text-white',
              htmlContainer: 'text-slate-500 dark:text-slate-400 text-sm mt-2',
              confirmButton: 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-md'
            }
          });
        }
      } catch (error) {
        console.error("Error al actualizar rol:", error);
      }
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || (u.email && u.email.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === "TODOS" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 font-sans">
      
      {/* HEADER */}
      <header className="relative bg-white dark:bg-slate-900 pt-10 pb-12 px-6 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 dark:from-slate-950 via-white dark:via-slate-900 to-purple-50 dark:to-slate-950 opacity-100 transition-colors duration-300"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-[120px]"></div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-200 dark:border-indigo-500/20 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
              ADMINISTRACIÓN
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Panel de Administración
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
              Administra los usuarios del sistema, sus roles, y explora los datos generales de alertas.
            </p>
          </div>
          <div className="flex-shrink-0">
            <LogoutButton className="px-5 py-2.5 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 text-slate-800 dark:text-white font-bold text-sm shadow-[0_4px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-white hover:shadow-[0_4px_25px_rgba(99,102,241,0.15)] dark:hover:bg-white/20 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300" />
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <section className="max-w-6xl mx-auto px-6 py-8 relative z-20">
        
        {/* SECCIÓN USUARIOS */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              Gestión de Usuarios
            </h2>
          </div>

          {/* FILTROS Y BÚSQUEDA */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="Buscar por nombre o correo..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors text-sm"
              />
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 w-full md:w-auto overflow-x-auto">
              {["TODOS", "USER", "JAC", "ALCALDIA"].map(rol => (
                <button 
                  key={rol}
                  onClick={() => setRoleFilter(rol)}
                  className={`px-5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${roleFilter === rol ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
                >
                  {rol}
                </button>
              ))}
            </div>
          </div>

          {/* LISTADO DE USUARIOS */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-500 font-medium">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <div key={user.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl dark:shadow-none dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] border border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col">
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl font-bold uppercase shrink-0">
                        {user.name ? user.name.charAt(0) : "U"}
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md tracking-wider uppercase ${
                        user.role === 'ADMIN' || user.role === 'SUPERADMIN' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                        user.role === 'ALCALDIA' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        user.role === 'JAC' ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                        "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg truncate" title={user.name}>{user.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm truncate" title={user.email}>{user.email}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                        Registrado: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700 space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                          Rol
                        </label>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value, user.name)}
                          disabled={user.role === 'ADMIN' || user.role === 'SUPERADMIN'}
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white text-sm rounded-xl px-3 py-2 font-semibold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                        >
                          <option value="USER">USER (Ciudadano)</option>
                          <option value="JAC">JAC (Líder Comunal)</option>
                          <option value="ALCALDIA">ALCALDIA (Funcionario)</option>
                          {user.role === 'ADMIN' && <option value="ADMIN">ADMIN</option>}
                          {user.role === 'SUPERADMIN' && <option value="SUPERADMIN">SUPERADMIN</option>}
                        </select>
                      </div>
                      
                      <button 
                        onClick={() => deleteUser(user.id)}
                        disabled={user.role === 'ADMIN' || user.role === 'SUPERADMIN'}
                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 font-bold text-xs py-2 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Eliminar Cuenta
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700 border-dashed">
                  <p className="text-slate-500 dark:text-slate-400">No se encontraron usuarios que coincidan con la búsqueda.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECCIÓN HUECOS (MANTENIDA DEL ORIGINAL, CON ESTILOS MEJORADOS) */}
        <div className="mb-6 border-t border-slate-200 dark:border-slate-800 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              Reportes en Sistema
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {huecos.map((h) => (
              <div key={h.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white mb-2 line-clamp-1" title={h.direccion}>
                  📍 {h.direccion}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Estado:</span>
                  <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md font-semibold">
                    {h.estado || 'Sin iniciar'}
                  </span>
                </div>
                {h.latitud && h.longitud && (
                  <p className="text-[11px] text-slate-400 font-mono mt-3 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                    {Number(h.latitud).toFixed(5)}, {Number(h.longitud).toFixed(5)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </section>
    </main>
  );
}
