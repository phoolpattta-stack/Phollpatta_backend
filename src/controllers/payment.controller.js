
const crypto = require("node:crypto");
const {
  createRazorpayOrder,
} = require("../services/payment.service");

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { address, couponCode } = req.body;

    const data = await createRazorpayOrder(userId, address, couponCode);

    res.json({
      message: "Razorpay order created",
      ...data,
    });
  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.verifyPayment = (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  console.log("VERIFY BODY:", req.body);

  // ✅ UPI has NO signature
  if (!razorpay_signature) {
    return res.json({ success: true });
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid payment signature" });
  }

  res.json({ success: true });
};
