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

  const blueDark = "#1e3a8a"; 
  const bluePrimary = "#2563eb"; 
  const blueLight = "#eff6ff";
  const googleError = searchParams.get("error");

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '14px',
    border: '2px solid #f3f4f6',
    backgroundColor: '#f9fafb',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '16px',
    color: '#000000',
    transition: '0.3s',
  };

  // 🔐 LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();

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
        return;
      }

      const destinations = {
        USER: "/huecos",
        JAC: "/huecos/jac",
        ALCALDIA: "/huecos/alcaldia",
        ADMIN: "/admin",
        SUPERADMIN: "/admin",
      };

      // 🔐 LEER TOKEN
      const destination = destinations[data.user?.role];

      // 🔥 REDIRECCIÓN SEGÚN ROL
      if (!destination) {
        alert("Tu cuenta no tiene un rol válido asignado.");
        return;
      }

      router.push(destination);

    } catch (error) {
      alert("Error al iniciar sesión");
    }
  };

  return (
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${blueDark} 0%, ${bluePrimary} 100%)`,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '20px'
    }}>
      
      {/* Botón Volver */}
      <Link href="/" style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        color: 'white',
        textDecoration: 'none',
        fontSize: '14px',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        padding: '10px 20px',
        borderRadius: '50px',
        backdropFilter: 'blur(10px)',
        transition: '0.3s',
        fontWeight: '500'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)'}
      >
        ← Volver al Inicio
      </Link>

      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '30px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '420px',
      }}>

        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{
            width: '70px',
            height: '70px',
            backgroundColor: blueLight,
            borderRadius: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 15px',
            border: `2px solid ${bluePrimary}`,
            fontSize: '30px',
            transform: 'rotate(-5deg)'
          }}>
            👤
          </div>
          <h1 style={{ fontSize: '26px', color: '#111827', margin: '0', fontWeight: '800' }}>
            Área de Usuario
          </h1>
          <p style={{ color: '#374151', fontSize: '14px', marginTop: '8px' }}>
            Ingresa tus datos para continuar
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* EMAIL */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: '700', color: '#111827' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="pepito@ejemplo.com"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* PASSWORD */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: '700', color: '#111827' }}>
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: bluePrimary,
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '14px',
              border: 'none',
              cursor: 'pointer',
              marginTop: '10px',
              boxShadow: `0 10px 20px -5px rgba(37, 99, 235, 0.4)`
            }}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/api/auth/google")}
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: 'white',
              color: '#374151',
              fontSize: '15px',
              fontWeight: 'bold',
              borderRadius: '14px',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M21.35 12.23c0-.71-.06-1.4-.17-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.54h3.14c1.84-1.7 2.89-4.2 2.89-7.33Z" />
                <path fill="#34A853" d="M12 22c2.64 0 4.85-.88 6.46-2.39l-3.14-2.54c-.88.59-2 .94-3.32.94-2.55 0-4.71-1.72-5.48-4.04H3.27v2.62A10 10 0 0 0 12 22Z" />
                <path fill="#FBBC05" d="M6.52 13.97A6.01 6.01 0 0 1 6.21 12c0-.68.12-1.34.31-1.97V7.41H3.27A10 10 0 0 0 2 12c0 1.61.39 3.13 1.07 4.59l3.45-2.62Z" />
                <path fill="#EA4335" d="M12 5.99c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.84 3.09 14.64 2 12 2a10 10 0 0 0-8.73 5.41l3.25 2.62C7.29 7.71 9.45 5.99 12 5.99Z" />
              </svg>
              Continuar con Google
            </span>
          </button>
        </form>

        {googleError && (
          <p style={{ color: '#dc2626', fontSize: '13px', textAlign: 'center', marginTop: '14px' }}>
            No fue posible iniciar sesión con Google. Inténtalo nuevamente.
          </p>
        )}

        {/* LINK */}
        <div style={{ marginTop: '30px', textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
          <p style={{ fontSize: '14px', color: '#374151' }}>
            ¿No tienes una cuenta?{' '}
            <Link href="/register" style={{ color: bluePrimary, fontWeight: 'bold' }}>
              Regístrate aquí
            </Link>
          </p>
          <p style={{ fontSize: '14px', color: '#374151', marginTop: '10px' }}>
            <Link href="/forgot_password" style={{ color: bluePrimary, fontWeight: 'bold' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
        </div>

      </div>
    </main>
  );
}
