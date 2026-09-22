"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const ROLE_DESTINATIONS = {
  USER: "/huecos",
  JAC: "/huecos/jac",
  ALCALDIA: "/huecos/alcaldia",
  ADMIN: "/admin",
  SUPERADMIN: "/admin",
};

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exchangeTicket } = useAuth();
  const [error, setError] = useState(null);

  useEffect(() => {
    const ticket = searchParams.get("ticket");

    if (!ticket) {
      setError("No se recibió un ticket de autenticación.");
      setTimeout(() => router.replace("/login"), 2000);
      return;
    }

    async function doExchange() {
      try {
        const data = await exchangeTicket(ticket);
        const destination = ROLE_DESTINATIONS[data.user?.role] || "/huecos";
        router.replace(destination);
      } catch (err) {
        console.error("Error al canjear ticket:", err);
        setError("No se pudo completar el inicio de sesión con Google.");
        setTimeout(() => router.replace("/login?error=google_login"), 2500);
      }
    }

    doExchange();
  }, [searchParams, exchangeTicket, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="text-center">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-3xl">
              ❌
            </div>
            <p className="text-red-600 dark:text-red-400 font-bold text-lg">{error}</p>
            <p className="text-slate-500 text-sm">Redirigiendo al inicio de sesión...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-lg">
              Completando inicio de sesión...
            </p>
            <p className="text-slate-500 text-sm">Verificando tu cuenta de Google</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}

