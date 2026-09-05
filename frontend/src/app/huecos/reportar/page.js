"use client";

import Link from "next/link";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// MapPicker se carga solo en el cliente (usa window y el SDK de Google Maps)
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });



export default function ReportarHueco() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    descripcion: "",
    direccion: "",
    barrio: "",
    imagen: null,
  });
  const [coords, setCoords] = useState({ latitud: null, longitud: null });
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Inicializar tema
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationChange = useCallback((lat, lng) => {
    setCoords({ latitud: lat, longitud: lng });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.imagen) {
      setError("Sube una foto del hueco");
      return;
    }
    
    if (!formData.barrio) {
      setError("Selecciona el barrio o comuna");
      return;
    }

    setSending(true);
    setSendError(null);

    try {
      const data = new FormData();
      data.append("direccion", formData.direccion);
      data.append("barrio", formData.barrio);
      data.append("descripcion", formData.descripcion);
      data.append("imagen", formData.imagen);

      if (coords.latitud !== null) data.append("latitud", coords.latitud);
      if (coords.longitud !== null) data.append("longitud", coords.longitud);

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${apiBaseUrl}/api/huecos`, {
        method: "POST",
        body: data,
        credentials: "include",
      });

      const result = await res.json();

      if (!res.ok) {
        setSendError(result.error || "Error al enviar el reporte. Inténtalo de nuevo.");
        setSending(false);
        return;
      }

      setSending(false);
      setShowSuccess(true);
      setTimeout(() => router.push("/huecos"), 1800);
    } catch (err) {
      console.error("Error en handleSubmit:", err);
      setSendError("Error de conexión. Verifica tu red e inténtalo de nuevo.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center py-12 px-4 font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-hidden">
      {/* Background Gradients and Patterns */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 dark:from-slate-950 via-white dark:via-slate-900 to-amber-50 dark:to-slate-950 opacity-100 transition-colors duration-300"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0000000a_1px,transparent_1px),linear-gradient(to_bottom,#0000000a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[60%] bg-orange-400/20 dark:bg-orange-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[60%] bg-amber-400/20 dark:bg-amber-600/20 rounded-full blur-[120px]"></div>
        
        {/* Silueta de Ciudad y Montañas (Skyline de Medellín) */}
        <div className="absolute bottom-0 left-0 w-full opacity-60 dark:opacity-80">
          <svg viewBox="0 0 1440 320" className="w-full h-[25vh] sm:h-[35vh] object-cover sm:object-fill" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            {/* Montañas de Medellín */}
            <path 
              className="fill-slate-200/60 dark:fill-slate-800/60 transition-colors duration-500" 
              d="M0,320 L0,180 Q120,90 280,160 T600,120 T950,200 T1250,110 T1440,190 L1440,320 Z" 
            />
            {/* Edificios traseros */}
            <path 
              className="fill-slate-200 dark:fill-slate-800 transition-colors duration-500" 
              d="M0,320 L0,220 L30,220 L30,170 L70,170 L70,240 L120,240 L120,150 L180,150 L180,210 L230,210 L230,130 L290,130 L290,190 L350,190 L350,110 L410,110 L410,230 L470,230 L470,160 L520,160 L520,210 L580,210 L580,100 L640,100 L640,220 L700,220 L700,140 L760,140 L760,200 L820,200 L820,120 L880,120 L880,230 L940,230 L940,150 L1000,150 L1000,210 L1060,210 L1060,90 L1120,90 L1120,220 L1180,220 L1180,130 L1240,130 L1240,190 L1300,190 L1300,110 L1360,110 L1360,210 L1440,210 L1440,320 Z" 
            />
            {/* Edificios frontales */}
            <path 
              className="fill-slate-300 dark:fill-slate-900 transition-colors duration-500" 
              d="M0,320 L0,270 L40,270 L40,230 L90,230 L90,290 L140,290 L140,210 L200,210 L200,280 L250,280 L250,180 L310,180 L310,260 L380,260 L380,160 L440,160 L440,270 L500,270 L500,200 L550,200 L550,250 L610,250 L610,150 L680,150 L680,280 L740,280 L740,190 L800,190 L800,240 L850,240 L850,170 L910,170 L910,260 L980,260 L980,180 L1040,180 L1040,250 L1100,250 L1100,140 L1170,140 L1170,260 L1220,260 L1220,200 L1280,200 L1280,240 L1340,240 L1340,160 L1400,160 L1400,270 L1440,270 L1440,320 Z" 
            />
          </svg>
          {/* Pequeña capa de gradiente para que se funda bien con la base */}
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-300 dark:from-slate-900 to-transparent"></div>
        </div>
      </div>

      <Link
        href="/huecos"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-5 py-2.5 bg-white/60 dark:bg-white/10 backdrop-blur-md border border-slate-200 dark:border-white/20 rounded-full text-slate-700 dark:text-white font-bold text-sm shadow-sm hover:shadow-md hover:bg-white dark:hover:bg-white/20 transition-all hover:-translate-x-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Volver
      </Link>

      <div className="relative z-10 w-full max-w-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] border border-white dark:border-slate-700 transition-colors">
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-3xl flex items-center justify-center mx-auto mb-5 border-2 border-orange-200 dark:border-orange-500/30 text-4xl shadow-inner transform rotate-3">
            🚧
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
            Reportar un hueco
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">
            Tu reporte ciudadano ayuda a que las autoridades actúen más rápido.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* BARRIO */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 text-sm font-bold mb-2">Barrio o Comuna</label>
            <input
              type="text"
              name="barrio"
              placeholder="Ej: Laureles, Belén, El Poblado..."
              value={formData.barrio}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[15px] focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors placeholder-slate-400"
            />
          </div>

          {/* DIRECCIÓN */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 text-sm font-bold mb-2">Dirección exacta o referencia</label>
            <input
              type="text"
              name="direccion"
              placeholder="Ej: Calle 45 con Carrera 70"
              value={formData.direccion}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[15px] focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors placeholder-slate-400"
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 text-sm font-bold mb-2">Descripción del daño</label>
            <textarea
              name="descripcion"
              rows="3"
              placeholder="Describe el tamaño, la profundidad o el riesgo que representa..."
              value={formData.descripcion}
              onChange={handleChange}
              required
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[15px] focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-colors placeholder-slate-400 resize-y"
            />
          </div>

          {/* IMAGEN */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 text-sm font-bold mb-2">Evidencia Fotográfica</label>
            <label
              htmlFor="imagen"
              className="flex items-center gap-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-4 cursor-pointer bg-slate-50/50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors group"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Vista previa"
                  className="w-16 h-16 object-cover rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  📷
                </div>
              )}
              <div>
                <p className="m-0 text-sm font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                  {formData.imagen ? formData.imagen.name : "Sube una foto del daño"}
                </p>
                <p className="m-0 text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                  Requerido. JPG o PNG (máx. 5MB)
                </p>
              </div>
            </label>
            <input
              id="imagen"
              type="file"
              name="imagen"
              accept="image/*"
              onChange={handleChange}
              className="hidden"
              required
            />
          </div>

          {/* MAPA */}
          <div>
            <label className="block text-slate-800 dark:text-slate-200 text-sm font-bold mb-2 flex justify-between items-center">
              <span>Ubicación en el mapa</span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">Opcional</span>
            </label>
            <div className="rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-600">
              <MapPicker
                address={formData.direccion}
                onLocationChange={handleLocationChange}
              />
            </div>
            {coords.latitud !== null && (
              <p className="mt-2 text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                Registrada: {coords.latitud.toFixed(4)}, {coords.longitud.toFixed(4)}
              </p>
            )}
          </div>

          {/* ERRORES */}
          {sendError && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {sendError}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm font-bold flex items-start gap-2">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              {error}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={sending}
            className={`w-full mt-2 py-4 px-6 rounded-2xl text-white font-extrabold text-base transition-all duration-300 shadow-lg ${
              sending 
                ? "bg-slate-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 hover:shadow-orange-500/30 hover:-translate-y-1 cursor-pointer"
            }`}
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando reporte...
              </span>
            ) : "Enviar reporte"}
          </button>
        </form>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-10 w-[90%] max-w-sm text-center shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 dark:border-slate-700">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-500/20 mx-auto mb-6 flex items-center justify-center shadow-inner">
              <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">¡Reporte enviado!</h2>
            <p className="text-slate-600 dark:text-slate-300 font-medium">
              Gracias por ayudar a construir una mejor ciudad para todos.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
