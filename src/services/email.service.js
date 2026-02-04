
// const nodemailer = require("nodemailer");
// require("dotenv").config();


// const transporter = nodemailer.createTransport({
//   host: process.env.MAIL_HOST,
//   port: Number(process.env.MAIL_PORT),
//   secure: true, // 🔥 REQUIRED for GoDaddy (port 465)
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// exports.sendEmail = async (to, subject, {text, html}, from) => {
//   console.log("SENDING OTP EMAIL TO:", to);
//   const senderEmail = from || process.env.SMTP_FROM_NO_REPLY;

//   await transporter.sendMail({
//     from: `"Phoolpatta" <${senderEmail}>`, // ✅ FORCE NAME
//     to,
//     subject,
//     text,
//     html,
//   });
// };
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT) || 465,
  secure: true, // true for port 465
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Important for GoDaddy on cloud servers
    ciphers: 'SSLv3'
  },
  connectionTimeout: 10000, // 10 seconds timeout
  greetingTimeout: 10000,
  socketTimeout: 10000,
  debug: process.env.NODE_ENV === 'development', // Enable debug in dev
  logger: process.env.NODE_ENV === 'development'
});

// Verify connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ GoDaddy Email Connection Error:', error.message);
  } else {
    console.log('✅ GoDaddy Email Server is ready to send emails');
  }
});

exports.sendEmail = async (to, subject, {text, html}, from) => {
  try {
    console.log("📧 SENDING EMAIL TO:", to);
    
    const senderEmail = from || process.env.MAIL_USER; // Use MAIL_USER as default
    
    const mailOptions = {
      from: `"Phoolpatta" <${senderEmail}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ EMAIL SENT SUCCESSFULLY:', {
      messageId: info.messageId,
      to: to,
      subject: subject
    });
    
    return info;
  } catch (error) {
    console.error('❌ EMAIL SEND ERROR:', error.message);
    throw error; // Re-throw so caller knows it failed
  }
};
