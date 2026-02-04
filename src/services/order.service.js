const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");


// exports.createOrderAfterPayment = async ({
//   userId,
//   checkoutSummary
// }) => {

//   for (let item of checkoutSummary.items) {
//     await Product.findByIdAndUpdate(item.productId, {
//       $inc: { stock: -item.quantity }
//     });
//   }

//   const order = await Order.create({
//     userId,
//     items: checkoutSummary.items,
//     deliveryAddress: checkoutSummary.deliveryAddress,
//     subtotal: checkoutSummary.subtotal,
//     discount: checkoutSummary.discount,
//     finalAmount: checkoutSummary.finalAmount,

//     paymentMethod: "ONLINE",
//     paymentStatus: "PAID",

//     orderStatus: "PLACED"
//   });

//   await Cart.findOneAndUpdate(
//     { userId },
//     { items: [], totalAmount: 0 }
//   );

//   return order;
// };
// order.service.js
exports.createOrderAfterPayment = async ({
  userId,
  checkoutSummary,
  paymentDetails
}) => {
  try {
    // Validate checkoutSummary
    if (!checkoutSummary) {
      throw new Error("Checkout summary is required");
    }

    if (!checkoutSummary.items || !Array.isArray(checkoutSummary.items)) {
      throw new Error("Invalid items in checkout summary");
    }

    if (!checkoutSummary.deliveryAddress) {
      throw new Error("Delivery address is required");
    }

    if (!checkoutSummary.finalAmount || checkoutSummary.finalAmount <= 0) {
      throw new Error("Invalid final amount");
    }

    // Create order
    const order = new Order({
      userId,
      items: checkoutSummary.items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price || (item.total / item.quantity), // Calculate if not provided
        quantity: item.quantity,
        total: item.total
      })),
      subtotal: checkoutSummary.subtotal,
      discount: checkoutSummary.discount || 0,
      finalAmount: checkoutSummary.finalAmount,
      deliveryAddress: checkoutSummary.deliveryAddress,
      paymentMethod: "RAZORPAY",
      paymentStatus: "PAID",
      orderStatus: "PLACED",
      razorpayOrderId: paymentDetails.razorpayOrderId,
      razorpayPaymentId: paymentDetails.razorpayPaymentId
    });

    await order.save();

    // Clear user's cart after successful order
    await Cart.deleteMany({ userId });

    return order;

  } catch (error) {
    console.error("❌ createOrderAfterPayment Error:", error);
    throw error;
  }
};
/* =========================
   CREATE COD ORDER
========================= */
exports.createCODOrder = async ({ userId, checkoutSummary }) => {

  // Reduce stock
  for (let item of checkoutSummary.items) {
    await Product.findByIdAndUpdate(item.productId, {
      $inc: { stock: -item.quantity }
    });
  }

  // Create order
  const order = await Order.create({
    userId,
    items: checkoutSummary.items,
    deliveryAddress: checkoutSummary.deliveryAddress,
    subtotal: checkoutSummary.subtotal,
    discount: checkoutSummary.discount,
    finalAmount: checkoutSummary.finalAmount,
    paymentMethod: "COD",
    paymentStatus: "PENDING",
    orderStatus: "PLACED"
  });

  // Clear cart
  await Cart.findOneAndUpdate(
    { userId },
    { items: [], totalAmount: 0 }
  );

  return order;
};


