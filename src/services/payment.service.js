const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const { generateCheckoutSummary } = require("./checkout.service");
const RazorpayOrder = require("../models/RazorpayOrder"); // We'll create this model

// exports.createRazorpayOrder = async (userId, address, couponCode) => {
//   const checkout = await generateCheckoutSummary(userId, address, couponCode);

//   const amount = checkout.summary.finalAmount * 100;

//   const order = await razorpay.orders.create({
//     amount,
//     currency: "INR",
//     receipt: `rcpt_${Date.now()}`
//   });

//   return {
//     razorpayOrderId: order.id,
//     amount,
//     currency: order.currency,
//     checkoutSummary: checkout.summary
//   };
// };

exports.createRazorpayOrder = async (userId, address, couponCode) => {
  try {
    const checkout = await generateCheckoutSummary(
      userId,
      address,
      couponCode
    );

    const finalAmount = checkout?.summary?.finalAmount;

    if (!finalAmount || finalAmount <= 0) {
      throw new Error("Invalid finalAmount for Razorpay");
    }

    const amount = Math.round(finalAmount * 100); // paise

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    // ✅ STORE THE CHECKOUT SUMMARY IN DATABASE
    await RazorpayOrder.create({
      razorpayOrderId: order.id,
      userId,
      checkoutSummary: checkout.summary,
      amount,
      currency: order.currency,
      status: "CREATED",
    });

    return {
      razorpayOrderId: order.id,
      amount,
      currency: order.currency,
      checkoutSummary: checkout.summary,
    };
  } catch (err) {
    console.error("❌ Razorpay Order Error:", err);
    throw err;
  }
};

// exports.verifyPaymentSignature = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
//   const body = razorpayOrderId + "|" + razorpayPaymentId;

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(body.toString())
//     .digest("hex");

//   return expectedSignature === razorpaySignature;
// };
// exports.verifyPaymentSignature = (
//   razorpayOrderId,
//   razorpayPaymentId,
//   razorpaySignature
// ) => {
//   const body = razorpayOrderId + "|" + razorpayPaymentId;

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//     .update(body)
//     .digest("hex");

//   return expectedSignature === razorpaySignature;
// };
// const crypto = require("crypto");

// exports.verifyRazorpayPayment = (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//     } = req.body;

//     const body = `${razorpay_order_id}|${razorpay_payment_id}`;

//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET) // LIVE SECRET
//       .update(body)
//       .digest("hex");

//     if (expectedSignature !== razorpay_signature) {
//       console.error("❌ Signature mismatch");
//       return res.status(400).json({ message: "Invalid payment signature" });
//     }

//     res.status(200).json({ success: true });
//   } catch (err) {
//     console.error("Verify error:", err);
//     res.status(500).json({ message: "Payment verification failed" });
//   }
// };
