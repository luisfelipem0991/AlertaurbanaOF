import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: undefined,
    clientId: undefined,
    clientSecret: undefined,
    refreshToken: undefined,
  },
});
transporter.sendMail({
  from: 'test@example.com',
  to: 'test@example.com',
  subject: 'Test',
  text: 'Test'
}).then(console.log).catch(console.error);
