"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from "next/image";

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme from local storage or system preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <main className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans min-h-screen flex flex-col selection:bg-orange-500 selection:text-white transition-colors duration-300">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 flex justify-between items-center px-6 md:px-12 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-3 cursor-pointer">
          <Image src="/logo-final.png" alt="Logo Alerta Urbana" width={56} height={56} className="object-contain" />
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight hidden sm:block">Alerta<span className="text-orange-500">Urbana</span></h1>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden md:flex space-x-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#caracteristicas" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Características</a>
            <a href="#como-funciona" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">¿Cómo funciona?</a>
          </div>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <Link href="/login" className="bg-slate-900 dark:bg-orange-500 text-white px-5 sm:px-6 py-2 sm:py-2.5 rounded-full font-medium hover:bg-orange-500 dark:hover:bg-orange-400 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base">
            Iniciar Sesión
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 px-6 lg:px-12 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-orange-100 dark:bg-orange-900/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 text-sm font-semibold mb-6 border border-orange-200 dark:border-orange-500/20">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Plataforma ciudadana activa
            </div>
            <h2 className="text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tight">
              Transforma tu ciudad, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-amber-400">
                un reporte a la vez.
              </span>
            </h2>
            <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              La movilidad de tu ciudad está en tus manos. Reporta huecos y daños en la infraestructura vial en segundos y ayuda a las autoridades a tomar acción inmediata.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/login">
                <button className="w-full sm:w-auto bg-orange-500 text-white font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:bg-orange-600 hover:shadow-orange-500/30 dark:hover:shadow-orange-500/20 transition-all transform hover:-translate-y-1">
                  Comenzar ahora
                </button>
              </Link>
              <a href="#como-funciona" className="w-full sm:w-auto px-8 py-4 rounded-full text-lg font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-center">
                Descubre cómo
              </a>
            </div>
          </div>
          
          <div className="relative flex justify-center lg:justify-end items-center mt-10 lg:mt-0">
            {/* Abstract decorative elements behind logo */}
            <div className="absolute w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] bg-gradient-to-tr from-slate-100 dark:from-slate-800 to-white dark:to-slate-900 rounded-full shadow-2xl border border-slate-100/50 dark:border-slate-700/50 animate-[spin_60s_linear_infinite] z-0"></div>
            <div className="absolute w-[250px] h-[250px] lg:w-[350px] lg:h-[350px] bg-white dark:bg-slate-800 rounded-full shadow-inner z-0"></div>
            
            <Image 
              src="/logo-final.png" 
              alt="Logo Alerta Urbana" 
              width={380} 
              height={380} 
              className="relative z-10 object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700"
              priority
            />
            
            {/* Floating cards to simulate tech vibe */}
            <div className="absolute -left-4 lg:-left-12 top-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 flex items-center gap-3 animate-[bounce_4s_infinite]">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-500 text-xl">📍</div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Nuevo Reporte</p>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold">Av. Principal</p>
              </div>
            </div>

            <div className="absolute -right-4 lg:-right-8 bottom-10 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 z-20 flex items-center gap-3 animate-[bounce_5s_infinite_reverse]">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-500 text-xl">✅</div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Estado</p>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold">Reparado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Impact */}
      <section className="bg-slate-900 dark:bg-slate-950 py-16 px-6 relative overflow-hidden transition-colors duration-300">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-800 text-center relative z-10">
          <div className="px-4">
            <h4 className="text-4xl font-black text-white mb-2">100%</h4>
            <p className="text-slate-400 font-medium">Participación ciudadana</p>
          </div>
          <div className="px-4">
            <h4 className="text-4xl font-black text-orange-500 mb-2">+24h</h4>
            <p className="text-slate-400 font-medium">Monitoreo continuo</p>
          </div>
          <div className="px-4">
            <h4 className="text-4xl font-black text-white mb-2">GPS</h4>
            <p className="text-slate-400 font-medium">Geolocalización precisa</p>
          </div>
          <div className="px-4">
            <h4 className="text-4xl font-black text-orange-500 mb-2">Tiempo Real</h4>
            <p className="text-slate-400 font-medium">Actualizaciones de estado</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="caracteristicas" className="py-24 px-6 lg:px-12 max-w-7xl mx-auto transition-colors duration-300">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <h2 className="text-orange-500 font-extrabold tracking-widest uppercase text-sm mb-3">Herramientas</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
            Todo lo que necesitas para reportar
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Nuestra plataforma está diseñada para ser rápida, intuitiva y sumamente efectiva. Documenta el problema y deja que el sistema haga el resto.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-orange-100 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center text-3xl mb-8 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <h4 className="font-bold text-2xl mb-4 text-slate-900 dark:text-white">Ubicación Precisa</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Integración con mapas interactivos para marcar con exactitud milimétrica dónde se encuentra el daño en la vía.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-3xl mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <h4 className="font-bold text-2xl mb-4 text-slate-900 dark:text-white">Evidencia Fotográfica</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Sube fotos del hueco desde tu dispositivo para que las autoridades puedan evaluar la magnitud del problema al instante.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-10 rounded-[2rem] shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 hover:-translate-y-2 transition-transform duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center text-3xl mb-8 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <h4 className="font-bold text-2xl mb-4 text-slate-900 dark:text-white">Seguimiento Real</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Mantente informado con notificaciones y estados actualizados. Sabrás exactamente cuándo se resuelve tu reporte.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 px-6 lg:px-12 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-orange-500 font-extrabold tracking-widest uppercase text-sm mb-3">Flujo del proceso</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-8">
                Tres pasos simples para una mejor ciudad
              </h3>
              
              <div className="space-y-12 mt-12">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-xl font-bold text-slate-800 dark:text-slate-200">
                    1
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Crea tu cuenta</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Regístrate en pocos segundos usando tus datos básicos. Tu perfil ciudadano nos ayuda a dar validez a los reportes.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-orange-500 border-4 border-orange-100 dark:border-orange-500/30 shadow-lg shadow-orange-500/30 dark:shadow-none flex items-center justify-center text-xl font-bold text-white">
                    2
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sube un reporte</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Indica dónde está el daño, agrega una fotografía clara y describe brevemente el nivel de peligro.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-xl font-bold text-slate-800 dark:text-slate-200">
                    3
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Gestión y solución</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Las autoridades competentes revisan la alerta, priorizan el caso y ejecutan el mantenimiento vial.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-200 dark:bg-slate-800 h-[600px] hidden lg:block">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 dark:opacity-30"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
              <div className="absolute bottom-10 left-10 right-10">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-white">
                  <h4 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    Impacto Real
                  </h4>
                  <p className="text-slate-200">
                    Las ciudades que implementan sistemas de reporte ciudadano reducen sus tiempos de respuesta en un 40%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-slate-900"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/20 via-slate-900 to-slate-900"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            ¿Listo para ser parte de la solución?
          </h2>
          <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
            Únete a la red ciudadana que está construyendo calles más seguras y eficientes para todos los conductores y peatones.
          </p>
          <Link href="/login">
            <button className="bg-orange-500 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-orange-400 hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.5)] transition-all transform hover:-translate-y-1">
              Iniciar Sesión Ahora
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 py-12 px-6 lg:px-12 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo-final.png" alt="Logo" width={40} height={40} className="object-contain grayscale opacity-60 dark:opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" />
            <span className="text-xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">AlertaUrbana</span>
          </div>
          
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Términos</a>
            <a href="#" className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Contacto</a>
          </div>

          <p className="text-sm">© {new Date().getFullYear()} Proyecto de Grado</p>
        </div>
      </footer>

    </main>
  );
}
