import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: "test@gmail.com",
    clientId: "123.apps.googleusercontent.com",
    clientSecret: "secret",
    refreshToken: "1//invalid_token",
  },
});
transporter.sendMail({
  from: 'test@gmail.com',
  to: 'test@gmail.com',
  subject: 'Test',
  text: 'Test'
}).then(console.log).catch(e => console.error("Error:", e.message));
