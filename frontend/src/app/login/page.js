"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // ✅ ESTADOS
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const blueDark = "#1e3a8a"; 
  const bluePrimary = "#2563eb"; 
  const blueLight = "#eff6ff";

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
      const res = await fetch(`${apiBaseUrl}/api/login`, {
        method: "POST",
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

  localStorage.setItem("token", data.token);

// 🔐 LEER TOKEN
const payload = JSON.parse(atob(data.token.split(".")[1]));

// 🔥 REDIRECCIÓN SEGÚN ROL
if (payload.role === "ADMIN" || payload.role === "SUPERADMIN") {
  router.push("/admin");
} else {
  router.push("/huecos");
}

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
          
          {/* NOMBRE */}
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontWeight: '700', color: '#111827' }}>
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Ej: Pepito Pérez"
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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
        </form>

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