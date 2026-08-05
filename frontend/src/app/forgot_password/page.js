"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "";

  // "email" | "code" | "reset"
  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

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

  const buttonStyle = (disabled) => ({
    width: '100%',
    padding: '15px',
    backgroundColor: bluePrimary,
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '14px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    marginTop: '10px',
  });

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

  // PASO 1: pide el código al correo
  const handleSendCode = async (e) => {
    e.preventDefault();

    setSending(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/forgot-password/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      // El backend responde con un mensaje genérico exista o no el correo,
      // así que siempre avanzamos al siguiente paso.
      setStep("code");
      startResendCooldown();
    } catch (error) {
      alert("Error al solicitar el código");
    } finally {
      setSending(false);
    }
  };

  // PASO 2: valida el código y obtiene el token temporal para cambiar la contraseña
  const handleVerifyCode = async (e) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(code)) {
      alert("El código debe ser de 4 dígitos");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/forgot-password/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setResetToken(data.resetToken);
      setStep("reset");
    } catch (error) {
      alert("Error al verificar el código");
    } finally {
      setVerifying(false);
    }
  };

  // Reenviar código (vuelve a llamar el mismo endpoint del paso 1)
  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setSending(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/forgot-password/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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

  // PASO 3: envía el token temporal + la nueva contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    setResetting(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken,
          newPassword,
          confirmPassword,
        }),
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
      alert("Error al cambiar la contraseña");
    } finally {
      setResetting(false);
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

      <Link href="/login" style={{
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
        ← Volver al inicio de sesión
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

        {step === "email" && (
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
                🔑
              </div>
              <h1 style={{ fontSize: '26px', color: '#111827', margin: '0', fontWeight: '800' }}>
                Recuperar contraseña
              </h1>
              <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '8px' }}>
                Ingresa tu correo y te enviaremos un código
              </p>
            </div>

            <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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

              <button type="submit" disabled={sending} style={buttonStyle(sending)}>
                {sending ? "Enviando código..." : "Enviar código"}
              </button>
            </form>

            <div style={{ marginTop: '25px', textAlign: 'center' }}>
              <p style={{ fontSize: '14px', color: '#374151' }}>
                ¿Ya recordaste tu contraseña?{' '}
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
              <h1 style={{ fontSize: '26px', color: '#111827', margin: '0', fontWeight: '800' }}>
                Verifica el código
              </h1>
              <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '8px' }}>
                Si el correo está registrado, enviamos un código de 4 dígitos a<br />
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

              <button type="submit" disabled={verifying} style={buttonStyle(verifying)}>
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
                onClick={() => setStep("email")}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                ← Corregir correo
              </button>
            </div>
          </>
        )}

        {step === "reset" && (
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
                🔒
              </div>
              <h1 style={{ fontSize: '26px', color: '#111827', margin: '0', fontWeight: '800' }}>
                Nueva contraseña
              </h1>
              <p style={{ color: '#4b5563', fontSize: '14px', marginTop: '8px' }}>
                Elige una nueva contraseña para tu cuenta
              </p>
            </div>

            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Nueva contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  style={inputStyle}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div>
                <label style={labelStyle}>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  placeholder="Repite tu nueva contraseña"
                  style={inputStyle}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button type="submit" disabled={resetting} style={buttonStyle(resetting)}>
                {resetting ? "Guardando..." : "Cambiar contraseña"}
              </button>
            </form>
          </>
        )}
      </div>

      {/* MODAL DE ÉXITO */}
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
              ¡Contraseña actualizada!
            </h2>
            <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '10px', lineHeight: '1.5' }}>
              Ya puedes iniciar sesión con tu nueva contraseña. Te estamos llevando al inicio de sesión...
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