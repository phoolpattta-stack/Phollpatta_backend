// const twilio = require("twilio");

// const client = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// exports.sendSMSOTP = async (phone, otp) => {
//   try {
//     console.log("SMS OTP RECEIVED:", otp);

//   if (!otp) {
//     throw new Error("OTP missing in SMS service");
//   }
//     // Phone MUST be E.164
//     if (!phone.startsWith("+")) {
//       throw new Error("Phone number must be in E.164 format");
//     }

//     await client.messages.create({
//       to: phone,
//       messagingServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
//       body: `Your OTP is ${otp}`
//     });

//     console.log("SMS OTP sent successfully");

//   } catch (err) {
//     console.error("SMS OTP Error:", err.message);
//     throw new Error("SMS OTP failed");
//   }
// };
const axios = require("axios");

exports.sendSMSOTP = async (phone, otp) => {
  try {
    console.log("SMS OTP RECEIVED:", otp);

    if (!otp) {
      throw new Error("OTP missing in SMS service");
    }

    // Accept +91 or 10-digit
    let mobile = phone.replace("+", "");

    if (!mobile.startsWith("91")) {
      mobile = "91" + mobile;
    }

    const response = await axios.post(
      "https://control.msg91.com/api/v5/otp",
      {
        mobile,
        otp,
        template_id: process.env.MSG91_TEMPLATE_ID,
      },
      {
        headers: {
          "Content-Type": "application/json",
          authkey: process.env.MSG91_AUTH_KEY,
        },
      }
    );

    console.log("MSG91 Response:", response.data);

    if (!response.data || response.data.type !== "success") {
      throw new Error("MSG91 OTP send failed");
    }

    console.log("SMS OTP sent successfully via MSG91");
  } catch (err) {
    console.error(
      "SMS OTP Error:",
      err.response?.data || err.message
    );
    throw new Error("SMS OTP failed");
  }
};
