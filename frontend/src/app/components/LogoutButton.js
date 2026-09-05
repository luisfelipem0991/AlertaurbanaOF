"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({ style, className }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiBaseUrl}/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) throw new Error("Logout failed");

      router.replace("/login");
      router.refresh();
    } catch {
      alert("No se pudo cerrar la sesión. Intenta nuevamente.");
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
