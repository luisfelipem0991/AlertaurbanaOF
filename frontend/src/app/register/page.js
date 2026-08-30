"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // ✅ ESTADOS (NUEVO)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // 🔢 ESTADOS DE VERIFICACIÓN POR CÓDIGO (NUEVO)
  const [step, setStep] = useState("form"); // "form" | "code"
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const blueDark = "#1e3a8a"; 
  const bluePrimary = "#2563eb"; 
  const blueLight = "#ece5e5";

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '14px',
    border: '2px solid #696a6d',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '16px',
    color: '#000000',
    transition: '0.3s',
  };

  const labelStyle = {
    display: 'block',
    color: '#111827',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '6px',
  };

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

  // 🔐 PASO 1: valida el formulario y pide que se envíe el código al correo
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

      // ✅ Pasamos a la vista de "ingresa el código"
      setStep("code");
      startResendCooldown();

    } catch (error) {
      alert("Error al registrar");
    } finally {
      setSending(false);
    }
  };

  // 🔢 PASO 2: valida el código de 4 dígitos y crea la cuenta
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

      // ✅ Mostrar el modal en vez del alert()
      setShowSuccess(true);

      // 🔥 Redirige al login automáticamente después de un momento
      setTimeout(() => {
        router.push("/login");
      }, 2200);

    } catch (error) {
      alert("Error al verificar el código");
    } finally {
      setVerifying(false);
    }
  };

  // 🔁 Reenviar código (vuelve a llamar el mismo endpoint del paso 1)
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
    <main style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${blueDark} 0%, ${bluePrimary} 100%)`,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '20px'
    }}>

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
        fontWeight: '500'
      }}>
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

        <style>{`
          input::placeholder { color: #9ca3af; opacity: 1; }
          @keyframes popIn {
            0% { transform: scale(0.7); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes checkDraw {
            0% { stroke-dashoffset: 40; }
            100% { stroke-dashoffset: 0; }
          }
          @keyframes fadeIn {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}</style>

        {step === "form" && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
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
                transform: 'rotate(5deg)'
              }}>
                📝
              </div>
              <h1 style={{ fontSize: '26px', color: '#111827', margin: '0', fontWeight: '800' }}>Crear Cuenta</h1>
              <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '8px' }}>Únete a nuestra plataforma</p>
            </div>

            {/* ✅ FORM CON LÓGICA */}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {/* NOMBRE */}
              <div>
                <label style={labelStyle}>Nombre completo</label>
                <input
                  type="text"
                  placeholder="Ej: Pepito Pérez"
                  style={inputStyle}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* EMAIL */}
              <div>
                <label style={labelStyle}>Correo electrónico</label>
                <input
                  type="email"
                  placeholder="pepito@ejemplo.com"
                  style={inputStyle}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label style={labelStyle}>Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  style={inputStyle}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label style={labelStyle}>Confirmar contraseña</label>
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  style={inputStyle}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={sending} style={{
                width: '100%',
                padding: '15px',
                backgroundColor: bluePrimary,
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '14px',
                border: 'none',
                cursor: sending ? 'not-allowed' : 'pointer',
                opacity: sending ? 0.7 : 1,
                marginTop: '10px',
              }}>
                {sending ? "Enviando código..." : "Registrarse ahora"}
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
                  Registrarse con Google
                </span>
              </button>
            </form>

            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#374151' }}>
                ¿Ya tienes una cuenta?{' '}
                <Link href="/login" style={{ color: bluePrimary, fontWeight: 'bold' }}>
                  Inicia sesión
                </Link>
              </p>
            </div>
          </>
        )}

        {step === "code" && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
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
                transform: 'rotate(5deg)'
              }}>
                ✉️
              </div>
              <h1 style={{ fontSize: '26px', color: '#111827', margin: '0', fontWeight: '800' }}>Verifica tu correo</h1>
              <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '8px' }}>
                Enviamos un código de 4 dígitos a<br />
                <strong>{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyCode} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Código de verificación</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="0000"
                  style={{
                    ...inputStyle,
                    textAlign: 'center',
                    fontSize: '28px',
                    letterSpacing: '10px',
                    fontWeight: 'bold',
                  }}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                />
              </div>

              <button type="submit" disabled={verifying} style={{
                width: '100%',
                padding: '15px',
                backgroundColor: bluePrimary,
                color: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '14px',
                border: 'none',
                cursor: verifying ? 'not-allowed' : 'pointer',
                opacity: verifying ? 0.7 : 1,
                marginTop: '10px',
              }}>
                {verifying ? "Verificando..." : "Confirmar código"}
              </button>
            </form>

            <div style={{ marginTop: '20px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={handleResendCode}
                disabled={resendCooldown > 0 || sending}
                style={{
                  background: 'none',
                  border: 'none',
                  color: resendCooldown > 0 ? '#9ca3af' : bluePrimary,
                  fontWeight: 'bold',
                  fontSize: '14px',
                  cursor: resendCooldown > 0 ? 'default' : 'pointer',
                }}
              >
                {resendCooldown > 0 ? `Reenviar código (${resendCooldown}s)` : "Reenviar código"}
              </button>

              <button
                onClick={() => setStep("form")}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ← Corregir datos del formulario
              </button>
            </div>
          </>
        )}
      </div>

      {/* 🎉 MODAL DE ÉXITO */}
      {showSuccess && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '28px',
              padding: '40px 32px',
              width: '90%',
              maxWidth: '360px',
              textAlign: 'center',
              boxShadow: '0 25px 60px -10px rgba(0, 0, 0, 0.45)',
              animation: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
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
                  style={{ animation: 'checkDraw 0.5s 0.2s ease-out forwards' }}
                />
              </svg>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>
              ¡Cuenta creada!
            </h2>
            <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '10px', lineHeight: '1.5' }}>
              Tu registro fue exitoso. Te estamos llevando al inicio de sesión...
            </p>

            <button
              onClick={() => router.push("/login")}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '13px',
                backgroundColor: bluePrimary,
                color: 'white',
                fontSize: '15px',
                fontWeight: 'bold',
                borderRadius: '14px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Ir a iniciar sesión ahora
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
