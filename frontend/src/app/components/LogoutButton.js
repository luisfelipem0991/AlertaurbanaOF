"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";

export default function LogoutButton({ style, className }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } catch {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'No se pudo cerrar la sesión. Intenta nuevamente.',
        confirmButtonColor: '#f97316'
      });
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={className || "px-4 py-2 rounded-xl border border-white/50 bg-white/15 text-white text-sm font-bold hover:bg-white/20 transition-colors"}
      style={{
        cursor: isLoggingOut ? "wait" : "pointer",
        opacity: isLoggingOut ? 0.7 : 1,
        ...style,
      }}
    >
      {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}
