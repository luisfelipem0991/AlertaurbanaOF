"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({ style }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      const response = await fetch("/api/logout", {
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
      style={{
        padding: "10px 16px",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.5)",
        backgroundColor: "rgba(255,255,255,0.15)",
        color: "white",
        fontSize: "14px",
        fontWeight: "700",
        cursor: isLoggingOut ? "wait" : "pointer",
        opacity: isLoggingOut ? 0.7 : 1,
        ...style,
      }}
    >
      {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}
