import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    const user = process.env.GMAIL_USER?.replace(/['" ]/g, "");
    const clientId = process.env.GMAIL_CLIENT_ID?.replace(/['" ]/g, "");
    const clientSecret = process.env.GMAIL_CLIENT_SECRET?.replace(/['" ]/g, "");
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.replace(/['" ]/g, "");

    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      // Forzar IPv4 en Railway para evitar ENETUNREACH
      tls: {
        rejectUnauthorized: false
      },
      auth: {
        type: "OAuth2",
        user: user,
        clientId: clientId,
        clientSecret: clientSecret,
        refreshToken: refreshToken,
      },
    });
  }
  return transporter;
}

export async function sendVerificationCodeEmail(toEmail, code) {
  const mailer = getTransporter();

  await mailer.sendMail({
    from: `"Alerta Urbana" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Tu código de verificación - Alerta Urbana",
    text: `Tu código de verificación es: ${code}. Vence en 10 minutos.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto;">
        <h2 style="color:#1e3a8a;">Verifica tu correo</h2>
        <p>Usa este código para completar tu registro en Alerta Urbana:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background:#ece5e5; padding: 16px; text-align:center; border-radius: 12px; color:#1e3a8a;">
          ${code}
        </div>
        <p style="color:#4b5563; font-size: 13px; margin-top: 16px;">
          Este código vence en 10 minutos. Si no solicitaste este registro, ignora este correo.
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetCodeEmail(toEmail, code) {
  const mailer = getTransporter();

  await mailer.sendMail({
    from: `"Alerta Urbana" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Recupera tu contraseña - Alerta Urbana",
    text: `Tu código para restablecer tu contraseña es: ${code}. Vence en 10 minutos.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto;">
        <h2 style="color:#1e3a8a;">Restablece tu contraseña</h2>
        <p>Usa este código para continuar con el cambio de contraseña en Alerta Urbana:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background:#ece5e5; padding: 16px; text-align:center; border-radius: 12px; color:#1e3a8a;">
          ${code}
        </div>
        <p style="color:#4b5563; font-size: 13px; margin-top: 16px;">
          Este código vence en 10 minutos. Si no solicitaste este cambio, ignora este correo; tu contraseña seguirá siendo la misma.
        </p>
      </div>
    `,
  });
}

export async function sendBarrioChangeCodeEmail(toEmail, code, newBarrio) {
  const mailer = getTransporter();

  await mailer.sendMail({
    from: `"Alerta Urbana" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: "Verifica tu cambio de barrio - Alerta Urbana",
    text: `Tu código para confirmar el cambio al barrio ${newBarrio} es: ${code}. Vence en 10 minutos.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 420px; margin: auto;">
        <h2 style="color:#1e3a8a;">Confirma tu cambio de barrio</h2>
        <p>Has solicitado cambiar tu zona de reportes a: <strong>${newBarrio}</strong></p>
        <p>Usa este código para confirmar el cambio:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background:#ece5e5; padding: 16px; text-align:center; border-radius: 12px; color:#1e3a8a;">
          ${code}
        </div>
        <p style="color:#4b5563; font-size: 13px; margin-top: 16px;">
          Este código vence en 10 minutos. Si no fuiste tú, ignora este correo.
        </p>
      </div>
    `,
  });
}
