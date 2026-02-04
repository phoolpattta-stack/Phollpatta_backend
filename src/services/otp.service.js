// const OTP = require('../models/OTP');

// const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// exports.createOTP = async (email, phone) => {
//   //  DO NOT reuse OTP from another user
//   //  Always bind OTP strictly to this email/phone

//   // Remove old OTPs only for THIS user
//   await OTP.deleteMany({
//     $or: [
//       { email },
//       phone ? { phone } : null
//     ].filter(Boolean)
//   });

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();

//   await OTP.create({
//     email,
//     phone: phone || null,
//     otp,
//     expiresAt: new Date(Date.now() + OTP_EXPIRY_MS)
//   });

//   return otp;
// };

// exports.verifyOTP = async (email, phone, otp) => {
  
//   // const record = await OTP.findOne({
//   //   email,
//   //   ...(phone ? { phone } : {})
//   // });

//   const record = await OTP.findOne({ email });


//   if (!record) {
//     throw new Error('OTP not found for this email/phone');
//   }

//   if (Date.now() > record.expiresAt.getTime()) {
//     await OTP.deleteOne({ _id: record._id });
//     throw new Error('OTP expired');
//   }

//   if (record.otp !== otp) {
//     throw new Error('Invalid OTP');
//   }

//   await OTP.deleteOne({ _id: record._id });
// };
const OTP = require("../models/OTP");

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

/* =========================
   CREATE OTP (EMAIL + PHONE)
========================= */
exports.createOTP = async (email, phone) => {
  if (!email && !phone) {
    throw new Error("Email or phone is required");
  }

  // Remove old OTPs for this email OR phone
  await OTP.deleteMany({
    $or: [
      email ? { email } : null,
      phone ? { phone } : null,
    ].filter(Boolean),
  });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.create({
    email: email || null,
    phone: phone || null,
    otp,
    expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
  });

  return otp;
};

/* =========================
   VERIFY OTP (EMAIL OR PHONE)
========================= */
exports.verifyOTP = async (email, phone, otp) => {
  if (!email && !phone) {
    throw new Error("Email or phone is required");
  }

  // Find OTP using either identifier
  const record = await OTP.findOne({
    otp,
    $or: [
      email ? { email } : null,
      phone ? { phone } : null,
    ].filter(Boolean),
  });

  if (!record) {
    throw new Error("Invalid OTP");
  }

  if (Date.now() > record.expiresAt.getTime()) {
    await OTP.deleteOne({ _id: record._id });
    throw new Error("OTP expired");
  }

  // OTP is valid → delete it
  await OTP.deleteOne({ _id: record._id });

  return true;
};
