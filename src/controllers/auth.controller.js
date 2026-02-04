

const User = require('../models/User');

const otpService = require('../services/otp.service');          // Email OTP (DB)
const emailService = require('../services/email.service');
const whatsappService = require('../services/whatsapp.service'); // Optional
const smsOtpService = require('../services/smsOtp.service');     // Twilio Verify
const googleService = require('../services/googleAuth.service');

const { hash, compare } = require('../utils/bcrypt.util');
const { generateToken } = require('../utils/jwt.util');

/* =========================================================
   SIGNUP - SEND OTP (EMAIL + SMS + WHATSAPP)
========================================================= */

exports.signup = async (req, res) => {
  try {
    let { name, email, phone, address, gender, password } = req.body;

    // ================== SANITIZE INPUT ==================
    email = email?.trim() || null;
    phone = phone?.trim() || null;

    if (!email && !phone) {
      return res.status(400).json({
        message: "Email or phone is required"
      });
    }

    // ================== CHECK EXISTING USER ==================
    const orQuery = [];
    if (email) orQuery.push({ email });
    if (phone) orQuery.push({ phone });

    const exists = await User.findOne({ $or: orQuery });
    if (exists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // ================== CREATE OTP ==================
    const otp = await otpService.createOTP(email, phone);

    // ================== SEND EMAIL OTP ==================
    // if (email) {
    //   await emailService.sendEmail(
    //     email,
    //     "OTP Verification",
    //     `Your OTP is ${otp}`
    //   );
    // }

   if (email) {
  await emailService.sendEmail(
    email,
    "Phoolpatta – OTP Verification",
    {
      text: `Your OTP is ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f6f8fa; padding: 20px;">
          <div style="max-width: 500px; margin: auto; background: #ffffff; padding: 24px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
            
            <h2 style="color: #2f855a; margin-bottom: 10px;">Phoolpatta</h2>
            
            <p style="font-size: 14px; color: #333;">Hello,</p>

            <p style="font-size: 14px; color: #333;">
              To continue with your verification on <strong>phoolpatta.com</strong>, please use the OTP below:
            </p>

            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; font-size: 24px; letter-spacing: 6px; font-weight: bold; color: #2f855a;">
                ${otp}
              </span>
            </div>

            <p style="font-size: 13px; color: #555;">
              This OTP is valid for <strong>5 minutes</strong>.  
              Please do not share this code with anyone.
            </p>

            <p style="font-size: 13px; color: #555;">
              If you did not request this, you can safely ignore this email.
            </p>

            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />

            <p style="font-size: 12px; color: #999;">
              © ${new Date().getFullYear()} Phoolpatta. All rights reserved.<br/>
              Visit us at <a href="https://phoolpatta.com" style="color: #2f855a;">phoolpatta.com</a>
            </p>
          </div>
        </div>
      `,
    },
    process.env.SMTP_FROM_NO_REPLY // ✅ THIS LINE

  );
}



    // ================== SEND SMS OTP ==================
    if (phone) {
      await smsOtpService.sendSMSOTP(phone, otp).catch(err =>
        console.error("SMS OTP failed:", err.message)
      );
    }

    // ================== SEND WHATSAPP OTP ==================
    // if (phone) {
    //   whatsappService.sendOTP(phone, otp).catch(err =>
    //     console.error("WhatsApp OTP failed:", err.message)
    //   );
    // }

    return res.json({
      message: "OTP sent successfully",
      email: email ? "sent" : "skipped",
      sms: phone ? "sent" : "skipped",
      whatsapp: phone ? "attempted" : "skipped"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Signup failed"
    });
  }
};

/* =========================================================
   VERIFY SIGNUP OTP
========================================================= */

exports.verifySignup = async (req, res) => {
  try {
    let { name, email, phone, address, gender, password, otp } = req.body;

    // ================== SANITIZE INPUT ==================
    email = email?.trim() || null;
    phone = phone?.trim() || null;

    if (!email && !phone) {
      return res.status(400).json({
        message: "Email or phone is required"
      });
    }

    if (!otp) {
      return res.status(400).json({
        message: "OTP is required"
      });
    }

    // ================== VERIFY OTP (DB BASED) ==================
    await otpService.verifyOTP(email, phone, otp);

    // ================== CREATE USER ==================
    const user = await User.create({
      name,
      email,
      phone,
      address,
      gender,
      password: await hash(password),
      isVerified: true
    });

    // ================== GENERATE TOKEN ==================
    return res.json({
      token: generateToken({
        id: user._id,
        role: user.role
      })
    });

  } catch (err) {
    console.error(err);
    return res.status(400).json({
      message: "OTP verification failed"
    });
  }
};

/* =========================================================
   LOGIN
========================================================= */
exports.login = async (req, res) => {
  const { emailOrPhone, password } = req.body;

  // ADMIN LOGIN
  if (
    emailOrPhone === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({
      token: generateToken({ id: 'ADMIN', role: 'ADMIN' })
    });
  }

  //USER LOGIN

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const valid = await compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  res.json({
    token: generateToken({ id: user._id, role: user.role })
  });
};

/* =========================================================
   GOOGLE LOGIN
========================================================= */
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const payload = await googleService.verifyGoogleToken(token);

    let user = await User.findOne({ email: payload.email });

    if (!user) {
      user = await User.create({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        isVerified: true
      });
    }

    res.json({
      token: generateToken({ id: user._id, role: user.role })
    });

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

/* =========================================================
   FORGOT PASSWORD - SEND OTP
========================================================= */
exports.forgotPassword = async (req, res) => {
  const { emailOrPhone } = req.body;

  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone: emailOrPhone }]
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Create Email OTP
  const otp = await otpService.createOTP(user.email, user.phone);

  // Send Email OTP
  await emailService.sendEmail(
    user.email,
    'Reset Password OTP',
    `Your OTP is ${otp}`
  );

  // Send SMS OTP
  if (user.phone) {
    await smsOtpService.sendSMSOTP(user.phone, otp);
  }

  if (user.phone) {
    await whatsappService.sendOTP(user.phone, otp);
  }


  res.json({ message: 'OTP sent for password reset' });
};

/* =========================================================
   RESET PASSWORD
========================================================= */

exports.resetPassword = async (req, res) => {
  try {
    const { email, phone, otp, newPassword } = req.body;

    if (!email && !phone) {
      return res
        .status(400)
        .json({ message: "Email or phone is required" });
    }

    if (!otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "OTP and new password are required" });
    }

    // ✅ Verify OTP (email OR phone OR both)
    await otpService.verifyOTP(email, phone, otp);

    // ✅ Find user by email OR phone
    const user = await User.findOne(
      email ? { email } : { phone }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Update password
    user.password = await hash(newPassword);
    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
