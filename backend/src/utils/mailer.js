import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
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
