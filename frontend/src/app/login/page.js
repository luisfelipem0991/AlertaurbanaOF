"use client";

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ ESTADOS
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const googleError = searchParams.get("error");

  // 🔐 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        setIsLoading(false);
        return;
      }

      const destinations = {
        USER: "/huecos",
        JAC: "/huecos/jac",
        ALCALDIA: "/huecos/alcaldia",
        ADMIN: "/admin",
        SUPERADMIN: "/admin",
      };

      const destination = destinations[data.user?.role];

      if (!destination) {
        alert("Tu cuenta no tiene un rol válido asignado.");
        setIsLoading(false);
        return;
      }

      router.push(destination);

    } catch (error) {
      alert("Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px]"></div>
      </div>

      {/* Botón Volver */}
      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-full backdrop-blur-md border border-slate-200 dark:border-slate-700 transition-all shadow-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Volver al Inicio
      </Link>

      <div className="relative z-10 w-full max-w-[400px] bg-white dark:bg-slate-800 p-8 sm:p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-300">
        
        {/* Encabezado */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-blue-100 dark:border-blue-800/50 text-3xl shadow-sm rotate-[-3deg]">
            👤
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Área de Usuario
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Ingresa tus credenciales para continuar
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          
          {/* EMAIL */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="tu@correo.com"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="Ingresa tu contraseña"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* BOTÓN LOGIN */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 dark:shadow-none transition-all transform hover:-translate-y-0.5"
          >
            {isLoading ? "Iniciando..." : "Iniciar Sesión"}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase">O</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <button
            type="button"
            onClick={() => window.location.assign("/api/auth/google")}
            className="w-full py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.17-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.54h3.14c1.84-1.7 2.89-4.2 2.89-7.33Z" />
              <path fill="#34A853" d="M12 22c2.64 0 4.85-.88 6.46-2.39l-3.14-2.54c-.88.59-2 .94-3.32.94-2.55 0-4.71-1.72-5.48-4.04H3.27v2.62A10 10 0 0 0 12 22Z" />
              <path fill="#FBBC05" d="M6.52 13.97A6.01 6.01 0 0 1 6.21 12c0-.68.12-1.34.31-1.97V7.41H3.27A10 10 0 0 0 2 12c0 1.61.39 3.13 1.07 4.59l3.45-2.62Z" />
              <path fill="#EA4335" d="M12 5.99c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.09 14.64 2 12 2a10 10 0 0 0-8.73 5.41l3.25 2.62C7.29 7.71 9.45 5.99 12 5.99Z" />
            </svg>
            Continuar con Google
          </button>
        </form>

        {googleError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-center">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              No fue posible iniciar sesión con Google. Inténtalo nuevamente.
            </p>
          </div>
        )}

        {/* LINKS */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center flex flex-col gap-3">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-bold transition-colors">
              Regístrate aquí
            </Link>
          </p>
          <Link href="/forgot_password" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold transition-colors">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

      </div>
    </main>
  );
}
