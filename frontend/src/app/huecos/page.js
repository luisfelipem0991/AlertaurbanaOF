"use client";

import Link from "next/link";
import Swal from 'sweetalert2';
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

import ProgressTracker from "@/app/components/ProgressTracker";

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
          {report.barrio && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 w-fit px-3 py-1 rounded-lg">
              <svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1v1H9V7zm5 0h1v1h-1V7zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1zm-5 4h1v1H9v-1zm5 0h1v1h-1v-1z" /></svg>
              <p className="m-0 text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide truncate max-w-[200px]">
                {report.barrio}
              </p>
            </div>
          )}
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
  const [activeTab, setActiveTab] = useState('comunidad');
  
  const [userBarrio, setUserBarrio] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [liked, setLiked] = useState({});
  const [likeCounts, setLikeCounts] = useState({});

  const filteredReports = reports.filter(r => {
    if (!userBarrio || !userBarrio.trim()) return true;
    const barrio = r.barrio || "";
    return barrio.toLowerCase() === userBarrio.toLowerCase().trim();
  });

  const myReports = reports.filter(r => currentUser && r.user_id === currentUser.id);
  const displayReports = activeTab === 'comunidad' ? filteredReports : myReports;

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

const BARRIOS_MEDELLIN_BELLO = [
  // User provided list
  "Aldea Pablo VI", "Alfonso López", "Andalucía", "Aranjuez", "Aures", "Belalcázar", "Belén Centro", 
  "Berlín", "Bermejal – Los Álamos", "Blanquizal", "Bolivariana", "Boston", "Boyacá", "Buenos Aires", 
  "Caicedo", "Calasanz", "Campo Valdés Nº 2", "Carpinelo", "Castilla", "Castropol", "Córdoba", 
  "Cristo Rey", "Doce de Octubre Nº 1", "Doce de Octubre Nº 2", "El Chagualo", "El Compromiso", 
  "El Centro", "El Pesebre", "El Playón de Los Comuneros", "El Pomar", "El Raizal", "El Rincón", 
  "El Salado", "El Tesoro", "Estadio", "Fátima", "Florencia", "Florida Nueva", "Francisco Antonio Zea", 
  "Fuente Clara", "Golondrinas", "Granizal", "Guayaquil", "Guayabal", "Héctor Abad Gómez", "Kennedy", 
  "La América", "La Avanzada", "La Castellana", "La Colina", "La Esperanza Nº 2", "La Floresta", 
  "La Francia", "La Frontera", "La Isla", "La Mansión", "La Milagrosa", "La Mota", "La Paralela", 
  "La Pilarica", "La Salle", "Las Brisas", "Las Granjas", "Las Lomas", "Las Palmas", "Laureles", 
  "Loma de Los Bernal", "López de Mesa", "Loreto", "Los Álamos", "Los Ángeles", "Los Balsos", 
  "Los Pinos", "Manila", "Manrique Central Nº 1", "Manrique Central Nº 2", "Manrique Oriental", 
  "Maruchenga", "Mirador del Doce", "Miranda", "Moravia", "Moscú Nº 1", "Moscú Nº 2", "Pablo VI", 
  "Pajarito", "Palenque", "Palermo", "Patio Bonito", "Pedregal", "Picachito", "Popular Nº 1", 
  "Popular Nº 2", "Prado", "Progreso Nº 2", "Robledo Centro", "Rosales", "San Benito", "San Bernardo", 
  "San Blas", "San Germán", "San Isidro", "San Javier", "San Martín de Porres", "San Pablo", 
  "San Pedro", "San Joaquín", "Santa Cruz", "Santa Fe", "Santa Inés", "Santander", 
  "Santo Domingo Savio Nº 1", "Santo Domingo Savio Nº 2", "Sevilla", "Tejelo", "Toscana", 
  "Tricentenario", "Trinidad", "Vallejuelos", "Veinte de Julio", "Versalles Nº 1", "Versalles Nº 2", 
  "Villa del Socorro", "Villa Guadalupe", "Villa Hermosa", "Villa Niza", "Villanueva",
  "Alcalá", "Altos de Niquía", "Barrio Nuevo", "Bellavista", "Briceño", "Cabañas", "Central", 
  "Centro de Bello", "Ciudad Fabricato", "Congolo", "El Danubio", "El Ducado", "El Mirador", 
  "El Pinar", "El Porvenir", "El Rosalpi", "El Rosario", "El Triunfo", "Fontidueño", "Granizal Bello", 
  "Guasimalito", "Hato Viejo", "La Cabañita", "La Cumbre", "La Estación", "La Gabriela", "La Madera", 
  "La Mina", "Mánchester", "Marantá", "Mesa", "Minuto de Dios", "Niquía", "Pachelly", "París", "Pérez", 
  "Santa Ana", "Serramonte", "Suárez", "Sucre", "Tierradentro", "Villas de Occidente", "Camacol"
].sort();

  const promptForBarrio = async (isChange = false, loggedUser = null) => {
    const targetUser = loggedUser || currentUser;
    
    // Generar opciones para el datalist
    const datalistOptions = BARRIOS_MEDELLIN_BELLO.map(b => `<option value="${b}"></option>`).join('');

    const { value: barrioInput } = await Swal.fire({
      title: isChange ? 'Cambiar mi zona' : '¿De qué barrio eres?',
      html: `
        <p class="text-sm text-slate-500 mb-4">${isChange ? 'Busca y selecciona tu nueva zona.' : 'Busca y selecciona tu barrio para ver los reportes relevantes.'}</p>
        <input list="barriosList" id="swal-barrio-input" class="swal2-input" placeholder="Buscar barrio..." value="${userBarrio || ''}">
        <datalist id="barriosList">
          ${datalistOptions}
        </datalist>
      `,
      allowOutsideClick: isChange,
      allowEscapeKey: isChange,
      showCancelButton: isChange,
      confirmButtonText: 'Guardar Barrio',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const inputVal = document.getElementById('swal-barrio-input').value.trim();
        if (!inputVal) {
          Swal.showValidationMessage('¡Debes seleccionar un barrio!');
          return false;
        }
        if (!BARRIOS_MEDELLIN_BELLO.includes(inputVal)) {
          Swal.showValidationMessage('Por favor selecciona un barrio válido de la lista desplegable.');
          return false;
        }
        return inputVal;
      }
    });

    if (barrioInput) {
      const formattedBarrio = barrioInput.trim();

      if (targetUser && targetUser.id) {
        if (isChange) {
          // FLUJO DE CAMBIO CON VERIFICACIÓN DE CORREO
          try {
            const reqRes = await fetch(`${apiBaseUrl}/api/users/me/request-barrio-change`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ barrio: formattedBarrio }),
            });
            const reqData = await reqRes.json();
            
            if (!reqRes.ok) {
              return Swal.fire('Error', reqData.error || 'No se pudo solicitar el cambio', 'error');
            }

            // Pedir el código
            const { value: codeInput } = await Swal.fire({
              title: 'Verifica tu identidad',
              text: 'Hemos enviado un código de 4 dígitos a tu correo.',
              input: 'text',
              inputPlaceholder: 'Ej: 1234',
              allowOutsideClick: false,
              allowEscapeKey: false,
              showCancelButton: true,
              confirmButtonText: 'Verificar y Cambiar',
              cancelButtonText: 'Cancelar',
              inputValidator: (value) => {
                if (!value || value.trim().length !== 4) return 'El código debe tener 4 dígitos';
              }
            });

            if (codeInput) {
              const verifyRes = await fetch(`${apiBaseUrl}/api/users/me/verify-barrio-change`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ code: codeInput.trim() }),
              });
              const verifyData = await verifyRes.json();

              if (verifyRes.ok) {
                setUserBarrio(formattedBarrio);
                setCurrentUser({ ...targetUser, barrio: formattedBarrio });
                Swal.fire({
                  icon: 'success',
                  title: '¡Cambio verificado!',
                  text: `Ahora estás viendo los reportes de ${formattedBarrio}.`,
                  timer: 2000,
                  showConfirmButton: false
                });
              } else {
                Swal.fire('Error', verifyData.error || 'Código incorrecto', 'error');
              }
            }
          } catch (e) {
            Swal.fire('Error', 'Ocurrió un error de red', 'error');
          }
        } else {
          // PRIMERA VEZ: Guardado directo sin código
          try {
            await fetch(`${apiBaseUrl}/api/users/me`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ barrio: formattedBarrio }),
            });
            setUserBarrio(formattedBarrio);
            setCurrentUser({ ...targetUser, barrio: formattedBarrio });
            Swal.fire({
              icon: 'success',
              title: '¡Listo!',
              text: `Ahora estás viendo los reportes de ${formattedBarrio}.`,
              timer: 2000,
              showConfirmButton: false
            });
          } catch (e) {
            console.error("No se pudo guardar el barrio en BD", e);
          }
        }
      } else {
        // INVITADO (No logueado): Guardar en localStorage
        setUserBarrio(formattedBarrio);
        localStorage.setItem("guestBarrio", formattedBarrio);
        Swal.fire({
          icon: 'success',
          title: '¡Listo!',
          text: `Ahora estás viendo los reportes de ${formattedBarrio}.`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    }
  };

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await fetch(`${apiBaseUrl}/api/huecos`);
        if (!res.ok) throw new Error("No se pudieron cargar los reportes");

        const data = await res.json();
        setReports(data);
        setLikeCounts(Object.fromEntries(data.map((r) => [r.id, r.likes_count || 0])));

        // Intentar cargar usuario y likes si está logueado
        let loggedUser = null;
        try {
          const userRes = await fetch(`${apiBaseUrl}/api/users/me`, { credentials: "include" });
          if (userRes.ok) {
            loggedUser = await userRes.json();
            setCurrentUser(loggedUser);
            if (loggedUser.barrio) {
              setUserBarrio(loggedUser.barrio);
            }
          }

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
          console.warn("Usuario no logueado");
        }

          // Si no está logueado, usar el de localStorage o preguntar
          if (!loggedUser) {
            const guestBarrio = localStorage.getItem("guestBarrio");
            if (guestBarrio) {
              setUserBarrio(guestBarrio);
            } else {
              setTimeout(() => promptForBarrio(false, null), 500);
            }
          } else if (!loggedUser.barrio) {
            // Si está logueado pero no tiene barrio, preguntar (y guardar en BD)
            setTimeout(() => promptForBarrio(false, loggedUser), 500);
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
      Swal.fire({
      icon: 'warning',
      title: 'Atención',
      text: 'Inicia sesión para poder apoyar un reporte.',
      confirmButtonColor: '#f97316'
    });
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
            <div className="w-full sm:w-auto">
              <LogoutButton className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/80 dark:border-white/20 text-slate-800 dark:text-white font-bold text-sm shadow-[0_4px_15px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:bg-white hover:shadow-[0_4px_25px_rgba(249,115,22,0.15)] dark:hover:bg-white/20 hover:scale-105 hover:-translate-y-0.5 transition-all duration-300" />
            </div>
          </div>
        </div>
      </header>

      {/* Lista de reportes */}
      <section className="max-w-6xl mx-auto px-6 py-8 -mt-12 relative z-20">
        
        {/* Barrio Selection Badge / Pestañita */}
        <div className="mb-8 flex justify-center">
          <div className="bg-white dark:bg-slate-800 p-2 pr-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 w-full max-w-lg flex items-center justify-between gap-3 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 dark:bg-orange-500/10 p-2.5 rounded-xl text-orange-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mostrando zona</span>
                <span className="text-[15px] font-extrabold text-slate-800 dark:text-white capitalize">
                  {userBarrio || "Todos los barrios"} {!currentUser && <span className="text-[10px] text-slate-400 lowercase ml-1">(invitado)</span>}
                </span>
              </div>
            </div>
            <button 
              onClick={() => promptForBarrio(true)}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl transition-all"
            >
              Cambiar
            </button>
          </div>
        </div>

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

                <div className="flex gap-6 mb-8 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setActiveTab('comunidad')}
            className={`px-1 pb-4 text-sm sm:text-base font-bold border-b-2 transition-colors ${activeTab === 'comunidad' ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
          >
            Reportes de mi Zona
          </button>
          {currentUser && (
            <button 
              onClick={() => setActiveTab('mis_reportes')}
              className={`px-1 pb-4 text-sm sm:text-base font-bold border-b-2 transition-colors ${activeTab === 'mis_reportes' ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
            >
              Mis Reportes
            </button>
          )}
        </div>

        {!loading && !error && displayReports.length === 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-sm border border-slate-100 dark:border-slate-700 border-dashed transition-colors">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {activeTab === 'mis_reportes' ? "Aún no tienes reportes" : (reports.length === 0 ? "Todo limpio" : "No hay resultados")}
            </h3>
            <p className="mt-2">
              {activeTab === 'mis_reportes' 
                ? "Todavía no has reportado ningún hueco. ¡Anímate a contribuir con tu comunidad!" 
                : (reports.length === 0 
                  ? "Todavía no hay huecos reportados en la plataforma. ¡Sé el primero en reportar uno!" 
                  : "No encontramos reportes para esta zona.")}
            </p>
          </div>
        )}

                {!loading && !error && displayReports.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayReports.map((report) => (
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-2xl rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/40 dark:border-slate-700/50 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 transition-colors">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 sm:px-8 sm:pt-8 border-b border-slate-100/50 dark:border-slate-700/50">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Detalle del Reporte
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-2.5 bg-slate-100/50 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-300 transition-colors backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:px-8 overflow-y-auto flex-1 flex flex-col md:flex-row gap-8">
              {/* Info y Foto */}
              <div className="flex-1 flex flex-col">
                <div className="w-full h-48 md:h-64 bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl overflow-hidden relative border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedReport.imagen_url || "https://via.placeholder.com/600x400?text=Sin+Imagen"}
                    alt="Hueco"
                    className="w-full h-full object-cover"
                  />
                  <span
                    className="absolute top-4 right-4 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md"
                    style={{
                      backgroundColor: (STATUS_STYLE[selectedReport.estado] || STATUS_STYLE.pendiente).bg,
                      color: (STATUS_STYLE[selectedReport.estado] || STATUS_STYLE.pendiente).color,
                    }}
                  >
                    {(STATUS_STYLE[selectedReport.estado] || STATUS_STYLE.pendiente).label}
                  </span>
                </div>

                <ProgressTracker estado={selectedReport.estado} prioridad={selectedReport.prioridad} />

                <div className="mb-6 mt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ubicación Reportada</p>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight">{selectedReport.direccion}</p>
                </div>

                <div className="mb-2 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descripción</p>
                  <p className="text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100/50 dark:border-slate-700/50 text-[15px] leading-relaxed backdrop-blur-sm h-full">
                    {selectedReport.descripcion}
                  </p>
                </div>
              </div>

              {/* Mapa de Google */}
              <div className="flex-1 flex flex-col">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ubicación en el Mapa</p>
                <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-3xl overflow-hidden border border-slate-200/50 dark:border-slate-700/50 min-h-[300px] backdrop-blur-sm">
                  {(() => {
                    let mapQuery = selectedReport.direccion.trim();
                    // Fix Colombian addresses: "Calle 34B #33b 05" -> "Calle 34B #33b-05"
                    mapQuery = mapQuery.replace(/(#\s*[a-zA-Z0-9]+)\s+(\d+)/g, "$1-$2");
                    if (!mapQuery.toLowerCase().includes('colombia')) {
                      mapQuery += ", Antioquia, Colombia";
                    }
                    return (
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`}
                      ></iframe>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100/50 dark:border-slate-700/50 flex items-center justify-between backdrop-blur-md">
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
