"use client";

import { useEffect, useRef, useState } from "react";

/**
 * MapPicker — componente de selección de ubicación con Azure Maps.
 *
 * Props:
 *   onLocationChange(lat, lng) — se llama cada vez que el usuario
 *     coloca o mueve el marcador en el mapa.
 *   initialLat  — latitud inicial (por defecto: centro de Medellín)
 *   initialLng  — longitud inicial (por defecto: centro de Medellín)
 */
export default function MapPicker({
  onLocationChange,
  address = "",
  initialLat = 6.2442,
  initialLng = -75.5812,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "no-key" | "error"
  const apiKey =
    process.env.NEXT_PUBLIC_AZURE_MAPS_KEY ||
    process.env.NEXT_PUBLIC_AZURE_MAPS_SUBSCRIPTION_KEY ||
    process.env.NEXT_PUBLIC_AZURE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_AZURE_MAPS_CLIENT_ID;

  useEffect(() => {
    if (!apiKey) {
      setStatus("no-key");
      return;
    }

    let isMounted = true;

    // Cargar SDK de Azure Maps (CSS + JS)
    const loadAzureMaps = () => {
      return new Promise((resolve, reject) => {
        if (window.atlas && window.atlas.Map) {
          resolve();
          return;
        }

        // Cargar CSS si no existe
        if (!document.getElementById("azure-maps-css")) {
          const link = document.createElement("link");
          link.id = "azure-maps-css";
          link.rel = "stylesheet";
          link.href = "https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.css";
          link.type = "text/css";
          document.head.appendChild(link);
        }

        // Cargar JS si no existe
        const existingScript = document.getElementById("azure-maps-script");
        if (existingScript) {
          if (window.atlas && window.atlas.Map) {
            resolve();
          } else {
            existingScript.addEventListener("load", resolve);
            existingScript.addEventListener("error", reject);
          }
          return;
        }

        const script = document.createElement("script");
        script.id = "azure-maps-script";
        script.src = "https://atlas.microsoft.com/sdk/javascript/mapcontrol/3/atlas.min.js";
        script.async = true;
        script.defer = true;
        script.addEventListener("load", () => {
          if (window.atlas && window.atlas.Map) {
            resolve();
          } else {
            reject(new Error("atlas no se inicializó correctamente"));
          }
        });
        script.addEventListener("error", () =>
          reject(new Error("No se pudo cargar Azure Maps SDK"))
        );
        document.head.appendChild(script);
      });
    };

    loadAzureMaps()
      .then(() => {
        if (!isMounted || !mapContainerRef.current) return;

        // Azure Maps utiliza coordenadas en formato GeoJSON [longitud, latitud]
        const map = new window.atlas.Map(mapContainerRef.current, {
          center: [initialLng, initialLat],
          zoom: 14,
          view: "Auto",
          authOptions: {
            authType: "subscriptionKey",
            subscriptionKey: apiKey,
          },
        });

        mapInstanceRef.current = map;

        map.events.add("ready", () => {
          if (!isMounted) return;

          // Controles de zoom
          if (window.atlas.control && window.atlas.control.ZoomControl) {
            map.controls.add([new window.atlas.control.ZoomControl()], {
              position: "top-right",
            });
          }

          // Clic en el mapa para posicionar o mover el marcador
          map.events.add("click", (e) => {
            if (!e.position) return;
            const [lng, lat] = e.position;

            if (markerRef.current) {
              markerRef.current.setOptions({ position: [lng, lat] });
            } else {
              markerRef.current = new window.atlas.HtmlMarker({
                position: [lng, lat],
                color: "#2563eb",
              });
              map.markers.add(markerRef.current);
            }

            onLocationChange(lat, lng);
          });

          setStatus("ready");
        });

        map.events.add("error", (err) => {
          console.error("Azure Maps error:", err);
          if (isMounted) setStatus("error");
        });
      })
      .catch((err) => {
        console.error("MapPicker error:", err.message);
        if (isMounted) setStatus("error");
      });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.dispose();
        } catch (_) {}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Busca la dirección escrita y sincroniza el marcador con el primer resultado.
  useEffect(() => {
    const query = address.trim();
    const map = mapInstanceRef.current;

    if (status !== "ready" || !map || !apiKey || query.length < 3) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          "api-version": "1.0",
          query,
          countrySet: "CO",
          limit: "1",
          "subscription-key": apiKey,
        });
        const response = await fetch(
          `https://atlas.microsoft.com/search/address/json?${params}`,
          { signal: controller.signal }
        );
        const result = await response.json();
        const position = result.results?.[0]?.position;

        if (!response.ok || !position) return;

        const { lat, lon } = position;
        map.setCamera({ center: [lon, lat], zoom: 16 });

        if (markerRef.current) {
          markerRef.current.setOptions({ position: [lon, lat] });
        } else {
          markerRef.current = new window.atlas.HtmlMarker({
            position: [lon, lat],
            color: "#2563eb",
          });
          map.markers.add(markerRef.current);
        }

        onLocationChange(lat, lon);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al buscar la dirección en Azure Maps:", error);
        }
      }
    }, 600);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [address, apiKey, onLocationChange, status]);

  // --- Renders alternativos según estado ---

  if (status === "no-key") {
    return (
      <div
        style={{
          width: "100%",
          height: "220px",
          borderRadius: "14px",
          background: "#fef9c3",
          border: "2px solid #fbbf24",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          color: "#92400e",
          padding: "16px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "28px" }}>🔑</span>
        <p style={{ margin: 0, fontWeight: "700", fontSize: "14px" }}>
          API Key de Azure Maps no configurada
        </p>
        <p style={{ margin: 0, fontSize: "12px" }}>
          Agrega{" "}
          <code
            style={{
              background: "#fef3c7",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            NEXT_PUBLIC_AZURE_MAPS_KEY
          </code>{" "}
          en{" "}
          <code
            style={{
              background: "#fef3c7",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            frontend/.env
          </code>
        </p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        style={{
          width: "100%",
          height: "220px",
          borderRadius: "14px",
          background: "#fee2e2",
          border: "2px solid #f87171",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          color: "#991b1b",
          textAlign: "center",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <span style={{ fontSize: "28px" }}>⚠️</span>
        <p style={{ margin: 0, fontWeight: "700", fontSize: "14px" }}>
          No se pudo cargar Azure Maps
        </p>
        <p style={{ margin: 0, fontSize: "12px" }}>
          Verifica que la clave de suscripción (Subscription Key) de Azure Maps sea válida.
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "220px" }}>
      {/* Spinner mientras carga */}
      {status === "loading" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            borderRadius: "14px",
            border: "2px solid #e5e7eb",
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              color: "#6b7280",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                border: "3px solid #d1d5db",
                borderTopColor: "#2563eb",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span style={{ fontSize: "13px", fontWeight: "600" }}>
              Cargando mapa de Azure...
            </span>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Contenedor del mapa */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "14px",
          overflow: "hidden",
          border: "2px solid #d1d5db",
        }}
      />
    </div>
  );
}
