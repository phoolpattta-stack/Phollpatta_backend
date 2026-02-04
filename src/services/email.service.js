
const nodemailer = require("nodemailer");
require("dotenv").config();


const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: true, // 🔥 REQUIRED for GoDaddy (port 465)
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

exports.sendEmail = async (to, subject, {text, html}, from) => {
  console.log("SENDING OTP EMAIL TO:", to);
  const senderEmail = from || process.env.SMTP_FROM_NO_REPLY;

  await transporter.sendMail({
    from: `"Phoolpatta" <${senderEmail}>`, // ✅ FORCE NAME
    to,
    subject,
    text,
    html,
  });
};
