import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;

function getGmailClient() {
  const user = process.env.GMAIL_USER?.replace(/['" ]/g, "");
  const clientId = process.env.GMAIL_CLIENT_ID?.replace(/['" ]/g, "");
  const clientSecret = process.env.GMAIL_CLIENT_SECRET?.replace(/['" ]/g, "");
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN?.replace(/['" ]/g, "");

  const oauth2Client = new OAuth2(clientId, clientSecret, "https://developers.google.com/oauthplayground");
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return { gmail: google.gmail({ version: "v1", auth: oauth2Client }), user };
}

/**
 * Construye un mensaje RFC 2822 y lo codifica en base64url.
 */
function buildRawMessage({ from, to, subject, html }) {
  const boundary = "boundary_" + Date.now();
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString("base64")}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: base64`,
    ``,
    Buffer.from(html).toString("base64"),
    `--${boundary}--`,
  ];

  const raw = lines.join("\r\n");
  // Gmail API requiere base64url (sin +, / ni =)
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sendEmail({ to, subject, html }) {
  const { gmail, user } = getGmailClient();
  const from = `"Alerta Urbana" <${user}>`;
  const raw = buildRawMessage({ from, to, subject, html });

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}

export async function sendVerificationCodeEmail(toEmail, code) {
  await sendEmail({
    to: toEmail,
    subject: "Tu código de verificación - Alerta Urbana",
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
  await sendEmail({
    to: toEmail,
    subject: "Recupera tu contraseña - Alerta Urbana",
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
  await sendEmail({
    to: toEmail,
    subject: "Verifica tu cambio de barrio - Alerta Urbana",
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
