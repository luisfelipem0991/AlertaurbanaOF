"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// MapPicker se carga solo en el cliente (usa window y el SDK de Google Maps)
const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

export default function ReportarHueco() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    descripcion: "",
    direccion: "",
    imagen: null,
  });
  const [coords, setCoords] = useState({ latitud: null, longitud: null });
  const [preview, setPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const blueDark = "#1e3a8a";
  const bluePrimary = "#2563eb";
  const blueLight = "#ece5e5";

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Callback que recibe el MapPicker cuando el usuario elige una ubicacion
  const handleLocationChange = (lat, lng) => {
    setCoords({ latitud: lat, longitud: lng });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);

    try {
      // Obtener user_id desde el token JWT guardado en localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setSendError("Debes iniciar sesión para reportar un hueco.");
        setSending(false);
        return;
      }
      const payload = JSON.parse(atob(token.split(".")[1]));
      const user_id = payload.id;

      const data = new FormData();
      data.append("user_id", user_id);
      data.append("direccion", formData.direccion);
      data.append("descripcion", formData.descripcion);
      data.append("imagen", formData.imagen);

      // Coordenadas son opcionales (pueden ser null si el usuario no uso el mapa)
      if (coords.latitud !== null) data.append("latitud", coords.latitud);
      if (coords.longitud !== null) data.append("longitud", coords.longitud);

      const res = await fetch("/api/huecos", {
        method: "POST",
        body: data,
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
      setSending(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: "14px",
    border: "2px solid #d1d5db",
    backgroundColor: "#ffffff",
    boxSizing: "border-box",
    outline: "none",
    fontSize: "15px",
    color: "#000000",
  };

  const labelStyle = {
    display: "block",
    color: "#111827",
    fontSize: "14px",
    fontWeight: "600",
    marginBottom: "8px",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${blueDark} 0%, ${bluePrimary} 100%)`,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <style>{`
        input::placeholder, textarea::placeholder { color: #9ca3af; opacity: 1; }
        input:focus, textarea:focus { border-color: ${bluePrimary} !important; }
        @keyframes popIn { 0% { transform: scale(0.7); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
        @keyframes checkDraw { 0% { stroke-dashoffset: 40; } 100% { stroke-dashoffset: 0; } }
      `}</style>

      <Link
        href="/huecos"
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "white",
          textDecoration: "none",
          fontSize: "14px",
          backgroundColor: "rgba(255, 255, 255, 0.15)",
          padding: "10px 20px",
          borderRadius: "50px",
          backdropFilter: "blur(10px)",
          fontWeight: "500",
        }}
      >
        ← Volver a reportes
      </Link>

      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "30px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          width: "100%",
          maxWidth: "560px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "70px",
              height: "70px",
              backgroundColor: blueLight,
              borderRadius: "22px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 15px",
              border: `2px solid ${bluePrimary}`,
              fontSize: "30px",
              transform: "rotate(5deg)",
            }}
          >
            🚧
          </div>
          <h1 style={{ fontSize: "26px", color: "#111827", margin: 0, fontWeight: "800" }}>
            Reportar un hueco
          </h1>
          <p style={{ color: "#4b5563", fontSize: "14px", marginTop: "8px" }}>
            Tu reporte ayuda a que las autoridades actúen más rápido
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* DIRECCIÓN */}
          <div>
            <label style={labelStyle}>Dirección o referencia</label>
            <input
              type="text"
              name="direccion"
              placeholder="Ej: Calle 45 con Carrera 70"
              value={formData.direccion}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div>
            <label style={labelStyle}>Descripción del daño</label>
            <textarea
              name="descripcion"
              rows="3"
              placeholder="Describe el tamaño, la profundidad o el riesgo que representa..."
              value={formData.descripcion}
              onChange={handleChange}
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
              required
            />
          </div>

          {/* IMAGEN */}
          <div>
            <label style={labelStyle}>Foto del hueco</label>
            <label
              htmlFor="imagen"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                border: "2px dashed #c7cad1",
                borderRadius: "14px",
                padding: "16px",
                cursor: "pointer",
                backgroundColor: "#fafafa",
              }}
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Vista previa"
                  style={{ width: "64px", height: "64px", objectFit: "cover", borderRadius: "10px" }}
                />
              ) : (
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "10px",
                    backgroundColor: blueLight,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    flexShrink: 0,
                  }}
                >
                  📷
                </div>
              )}
              <div>
                <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                  {formData.imagen ? formData.imagen.name : "Sube una foto del daño"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6b7280" }}>
                  JPG o PNG, máximo 5MB
                </p>
              </div>
            </label>
            <input
              id="imagen"
              type="file"
              name="imagen"
              accept="image/*"
              onChange={handleChange}
              style={{ display: "none" }}
              required
            />
          </div>

          {/* MAPA — Azure Maps para seleccionar ubicación del hueco */}
          <div>
            <label style={labelStyle}>
              Ubicación en el mapa
              <span style={{ fontWeight: "400", color: "#6b7280", marginLeft: "6px" }}>
                (opcional — haz clic para marcar el hueco)
              </span>
            </label>
            <MapPicker onLocationChange={handleLocationChange} />
            {/* Indicador de coordenadas seleccionadas */}
            {coords.latitud !== null && (
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "12px",
                  color: "#16a34a",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                ✅ Ubicación registrada: {coords.latitud.toFixed(5)}, {coords.longitud.toFixed(5)}
              </p>
            )}
          </div>

          {/* Mensaje de error al enviar */}
          {sendError && (
            <div
              style={{
                padding: "12px 16px",
                backgroundColor: "#fee2e2",
                border: "1.5px solid #f87171",
                borderRadius: "12px",
                color: "#991b1b",
                fontSize: "13px",
                fontWeight: "600",
              }}
            >
              ⚠️ {sendError}
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: bluePrimary,
              color: "white",
              fontSize: "16px",
              fontWeight: "bold",
              borderRadius: "14px",
              border: "none",
              cursor: sending ? "not-allowed" : "pointer",
              opacity: sending ? 0.7 : 1,
              marginTop: "6px",
            }}
          >
            {sending ? "Enviando..." : "Enviar reporte"}
          </button>
        </form>
      </div>

      {showSuccess && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.55)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            animation: "fadeIn 0.25s ease-out",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "28px",
              padding: "40px 32px",
              width: "90%",
              maxWidth: "360px",
              textAlign: "center",
              boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.45)",
              animation: "popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <div
              style={{
                width: "84px",
                height: "84px",
                borderRadius: "50%",
                backgroundColor: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 12.5L9.5 18L20 6"
                  stroke="#16a34a"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="40"
                  style={{ animation: "checkDraw 0.5s 0.2s ease-out forwards" }}
                />
              </svg>
            </div>
            <h2 style={{ fontSize: "22px", fontWeight: "800", color: "#111827", margin: 0 }}>
              ¡Reporte enviado!
            </h2>
            <p style={{ fontSize: "14px", color: "#4b5563", marginTop: "10px", lineHeight: "1.5" }}>
              Gracias por ayudar a mejorar las vías de tu ciudad.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
