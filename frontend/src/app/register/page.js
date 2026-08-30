"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // ✅ ESTADOS
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // 🔢 ESTADOS DE VERIFICACIÓN POR CÓDIGO
  const [step, setStep] = useState("form"); // "form" | "code"
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  function startResendCooldown() {
    setResendCooldown(30);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  // 🔐 PASO 1
  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/register/send-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setStep("code");
      startResendCooldown();

    } catch (error) {
      alert("Error al registrar");
    } finally {
      setSending(false);
    }
  };

  // 🔢 PASO 2
  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(code)) {
      alert("El código debe ser de 4 dígitos");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/register/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setShowSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2200);

    } catch (error) {
      alert("Error al verificar el código");
    } finally {
      setVerifying(false);
    }
  };

  // 🔁 Reenviar código
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setSending(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/register/send-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("Te enviamos un nuevo código");
      startResendCooldown();
    } catch (error) {
      alert("Error al reenviar el código");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px]"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[80px]"></div>
      </div>

      <Link href="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-full backdrop-blur-md border border-slate-200 dark:border-slate-700 transition-all shadow-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Volver al Inicio
      </Link>

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all duration-300">
        
        {step === "form" && (
          <div className="animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-blue-100 dark:border-blue-800/50 text-3xl shadow-sm rotate-[3deg]">
                📝
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Crear Cuenta</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Únete a nuestra plataforma ciudadana</p>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Nombre completo</label>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Correo electrónico</label>
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Contraseña</label>
                <input
                  type="password"
                  placeholder="Crea una contraseña segura"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="Confirma tu contraseña"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={sending} 
                className="w-full mt-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 dark:shadow-none transition-all transform hover:-translate-y-0.5"
              >
                {sending ? "Enviando código..." : "Registrarse ahora"}
              </button>
              
              <div className="relative flex items-center py-1">
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
                Registrarse con Google
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" className="text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 font-bold transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        )}

        {step === "code" && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-blue-100 dark:border-blue-800/50 text-3xl shadow-sm rotate-[5deg]">
                ✉️
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Verifica tu correo</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
                Enviamos un código de 4 dígitos a<br />
                <strong className="text-slate-800 dark:text-slate-200">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center">Código de verificación</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="0000"
                  className="w-full px-4 py-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-center text-4xl tracking-[0.5em] font-bold"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </div>

              <button 
                type="submit" 
                disabled={verifying} 
                className="w-full mt-2 py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 dark:shadow-none transition-all transform hover:-translate-y-0.5"
              >
                {verifying ? "Verificando..." : "Confirmar código"}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center gap-4">
              <button
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || sending}
                className={`text-sm font-bold transition-colors ${resendCooldown > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-orange-500 hover:text-orange-600 cursor-pointer'}`}
              >
                {resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : "Reenviar código"}
              </button>

              <button
                onClick={() => setStep("form")}
                className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Corregir datos del formulario
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🎉 MODAL DE ÉXITO */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-10 w-[90%] max-w-sm text-center shadow-2xl shadow-slate-900/50 border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none" className="text-green-500 dark:text-green-400">
                <path
                  d="M4 12.5L9.5 18L20 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
              ¡Cuenta creada!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8">
              Tu registro fue exitoso. Te estamos redirigiendo al inicio de sesión...
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all"
            >
              Ir a iniciar sesión ahora
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
