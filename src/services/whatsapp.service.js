const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendOTP = async (phone, otp) => {
  try {
    await client.messages.create({
      from: "whatsapp:+14155238886", // sandbox number
      to: `whatsapp:${phone}`,
      body: `Your OTP is ${otp}`
    });

    console.log("WhatsApp OTP sent");

  } catch (err) {
    console.error("WhatsApp OTP Error:", err.message);
  }
};
