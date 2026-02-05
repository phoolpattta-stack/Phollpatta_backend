
const { createOrderAfterPayment } = require("../services/order.service");
const Order = require("../models/Order");
const {sendEmail}= require("../services/email.service");
const User = require("../models/User");
const RazorpayOrder = require("../models/RazorpayOrder");
const orderInvoiceEmail = require("../utils/emailTemplates/orderInvoiceEmail");

const adminOrderEmail = require("../utils/emailTemplates/adminOrderEmail");

/* =========================
   CREATE ORDER (AFTER PAYMENT VERIFIED)
========================= */

// exports.createOrder = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id
//     } = req.body;

//     console.log("📦 CREATE ORDER REQUEST:");
//     console.log("- User ID:", req.user.id);
//     console.log("- Razorpay Order ID:", razorpay_order_id);
//     console.log("- Razorpay Payment ID:", razorpay_payment_id);

//     if (!razorpay_order_id || !razorpay_payment_id) {
//       return res.status(400).json({ 
//         message: "Payment details missing" 
//       });
//     }

//     // ✅ RETRIEVE STORED CHECKOUT SUMMARY
//     const razorpayOrder = await RazorpayOrder.findOne({
//       razorpayOrderId: razorpay_order_id,
//       userId: req.user.id
//     });

//     if (!razorpayOrder) {
//       return res.status(404).json({ 
//         message: "Razorpay order not found or unauthorized" 
//       });
//     }

//     if (razorpayOrder.status === "PAID") {
//       return res.status(400).json({ 
//         message: "Order already processed" 
//       });
//     }

//     const checkoutSummary = razorpayOrder.checkoutSummary;

//     console.log("✅ Retrieved Checkout Summary:", JSON.stringify(checkoutSummary, null, 2));

//     // Create order
//     const order = await createOrderAfterPayment({
//       userId: req.user.id,
//       checkoutSummary,
//       paymentDetails: {
//         razorpayOrderId: razorpay_order_id,
//         razorpayPaymentId: razorpay_payment_id,
//         status: "PAID"
//       }
//     });

//     // ✅ UPDATE RAZORPAY ORDER STATUS
//     razorpayOrder.status = "PAID";
//     await razorpayOrder.save();

//     console.log("✅ ORDER CREATED:", order._id);

//     // Send email
//     const user = await User.findById(req.user.id);
//     if (user?.email) {
//       await sendEmail(
//         user.email,
//         `Order Confirmed | ${order._id}`,
//         `Hi ${checkoutSummary.deliveryAddress.fullName},

// Your order has been placed successfully!

// Order ID: ${order._id}
// Amount Paid: ₹${order.finalAmount}

// Thank you for shopping with us.`
//       );
//     }

//     res.status(201).json({ order });

//   } catch (err) {
//     console.error("❌ ORDER CREATE ERROR:", err);
//     console.error("Error stack:", err.stack);
    
//     res.status(400).json({ 
//       message: err.message || "Failed to create order",
//       details: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };

exports.createOrder = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id } = req.body;

    // 1️⃣ Validate input
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ message: "Payment details missing" });
    }

    // 2️⃣ Find Razorpay order
    const razorpayOrder = await RazorpayOrder.findOne({
      razorpayOrderId: razorpay_order_id,
      userId: req.user.id,
    });

    if (!razorpayOrder) {
      return res.status(404).json({
        message: "Razorpay order not found or unauthorized",
      });
    }

    if (razorpayOrder.status === "PAID") {
      return res.status(400).json({
        message: "Order already processed",
      });
    }

    const checkoutSummary = razorpayOrder.checkoutSummary;

    // 3️⃣ Create final order
    const order = await createOrderAfterPayment({
      userId: req.user.id,
      checkoutSummary,
      paymentDetails: {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        status: "PAID",
      },
    });

    // 4️⃣ Update Razorpay order status
    razorpayOrder.status = "PAID";
    await razorpayOrder.save();

    // 5️⃣ RESPOND FIRST (⚡ low latency)
    res.status(201).json({ order });

    // 6️⃣ SEND EMAIL ASYNC (non-blocking)
    setImmediate(async () => {
      try {
        const user = await User.findById(req.user.id);
        if (!user?.email) return;

        const html = orderInvoiceEmail({
          customerName: checkoutSummary.deliveryAddress.fullName,
          orderId: order._id,
          amount: order.finalAmount,
          paymentMethod: order.paymentMethod || "Online",
          address: `
            ${checkoutSummary.deliveryAddress.addressLine},
            ${checkoutSummary.deliveryAddress.city},
            ${checkoutSummary.deliveryAddress.state}
            - ${checkoutSummary.deliveryAddress.pincode}
          `,
        });

        await sendEmail(
          user.email,
          `Order Confirmed | Invoice #${order._id}`,
          {
            text: `Your order ${order._id} has been confirmed.`,
            html,
          }, process.env.SMTP_FROM_ADMIN
        );


        //email to email 
        const adminEmail = process.env.ADMIN_EMAIL_ORDER ;

        if (adminEmail) {
          const adminHtml = adminOrderEmail({
            type: "PLACED",
            orderId: order._id,
            customerName: checkoutSummary.deliveryAddress.fullName,
            amount: order.finalAmount,
            paymentMethod: order.paymentMethod,
          });

          await sendEmail(
            adminEmail,
            `🛒 New Order Placed | ${order._id}`,
            {
              text: `New order placed. Order ID: ${order._id}`,
              html: adminHtml,
            },   process.env.SMTP_FROM_ADMIN // ✅ ADMIN SENDER

          );
        }


        console.log("✅ ORDER EMAIL SENT:", user.email);
      } catch (emailErr) {
        console.error("❌ ORDER EMAIL FAILED:", emailErr.message);
      }
    });

  } catch (err) {
    console.error("❌ ORDER CREATE ERROR:", err);

    // ⚠️ Prevent double response
    if (!res.headersSent) {
      res.status(400).json({
        message: err.message || "Failed to create order",
      });
    }
  }
};


/* =========================
   USER: GET MY ORDERS
========================= */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   USER: GET SINGLE ORDER
========================= */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   ADMIN: GET ALL ORDERS (FILTER + SORT + PAGINATION)
========================= */
exports.getAllOrders = async (req, res) => {
  try {
    const {
      status,
      paymentMethod,
      paymentStatus,
      from,
      to,
      sortBy = "date",
      order = "desc",
      page = 1,
      limit = 10,
      search
    } = req.query;

    const query = {};

    // 🔹 Filters
    if (status) query.orderStatus = status;
    if (paymentMethod) query.paymentMethod = paymentMethod;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    // 🔹 Date range
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    // 🔹 Search (orderId or phone)
    if (search) {
      query.$or = [
        { _id: search },
        { "deliveryAddress.phone": search }
      ];
    }

    // 🔹 Sorting
    let sortQuery = {};
    if (sortBy === "amount") {
      sortQuery.finalAmount = order === "asc" ? 1 : -1;
    } else {
      // default: date
      sortQuery.createdAt = order === "asc" ? 1 : -1;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate("userId", "name email")
      .sort(sortQuery)
      .skip(skip)
      .limit(Number(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




/* =========================
   ADMIN: UPDATE ORDER STATUS
========================= */
// exports.updateOrderStatus = async (req, res) => {
//   try {
//     const { status } = req.body;

//     const allowedStatuses = [
//       "PLACED",
//       "CONFIRMED",
//       "PACKED",
//       "OUT_FOR_DELIVERY",
//       "DELIVERED",
//       "CANCELLED"
//     ];

//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({ message: "Invalid order status" });
//     }

//     const order = await Order.findById(req.params.id);

//     if (!order)
//       return res.status(404).json({ message: "Order not found" });

//     order.orderStatus = status;
//     if (status === "DELIVERED" && order.paymentMethod === "COD") {
//   order.paymentStatus = "PAID";
// }

//     await order.save();

//     res.json({
//       message: "Order status updated",
//       order
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


exports.updateOrderStatus = async (req, res) => {
  try {
    const { status: newStatus } = req.body;
 
   const STATUS_FLOW = {
      PLACED: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["OUT_FOR_DELIVERY", "CANCELLED"],
      OUT_FOR_DELIVERY: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: []
    };

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    const currentStatus = order.orderStatus;

    // ❌ No updates allowed after DELIVERED or CANCELLED
    if (["DELIVERED", "CANCELLED"].includes(currentStatus)) {
      return res.status(400).json({
        message: `Order is already ${currentStatus} and cannot be updated`
      });
    }

    // ❌ Invalid transition
    if (!STATUS_FLOW[currentStatus]?.includes(newStatus)) {
      return res.status(400).json({
        message: `Cannot change order status from ${currentStatus} to ${newStatus}`
      });
    }

    // ✅ Update status
    order.orderStatus = newStatus;

    // ✅ Auto mark COD as paid on delivery
    if (newStatus === "DELIVERED" && order.paymentMethod === "COD") {
      order.paymentStatus = "PAID";
    }

    await order.save();

    res.json({
      message: "Order status updated successfully",
      order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { createCODOrder } = require("../services/order.service");

/* =========================
   CREATE COD ORDER
========================= */
// exports.createCODOrder = async (req, res) => {
//   try {
//     const { checkoutSummary } = req.body;

//     if (!checkoutSummary) {
//       return res.status(400).json({
//         message: "Checkout summary is required"
//       });
//     }

//     const order = await createCODOrder({
//       userId: req.user.id,
//       checkoutSummary
//     });
//     const user = await User.findById(req.user.id);

//     if (user?.email) {
//       await sendEmail(
//         user.email,
//         `Order Confirmed – Cash on Delivery | ${order._id}`,
//         `Hi ${checkoutSummary.deliveryAddress.fullName},

//           Your Cash on Delivery order has been placed successfully.

//           Order ID: ${order._id}
//           Amount: ₹${order.finalAmount}

//           You will pay the amount at delivery.

//           Thank you for shopping with us.`
//                 );
//               }

//     res.status(201).json({
//       message: "COD order placed successfully",
//       order
//     });

//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// };


//cancel order

exports.createCODOrder = async (req, res) => {
  try {
    const { checkoutSummary } = req.body;

    // 1️⃣ Validate input
    if (!checkoutSummary) {
      return res.status(400).json({
        message: "Checkout summary is required",
      });
    }

    // 2️⃣ Create COD order
    const order = await createCODOrder({
      userId: req.user.id,
      checkoutSummary,
    });

    // 3️⃣ RESPOND FIRST (⚡ low latency)
    res.status(201).json({
      message: "COD order placed successfully",
      order,
    });

    // 4️⃣ SEND EMAIL ASYNC (non-blocking)
    setImmediate(async () => {
      try {
        const user = await User.findById(req.user.id);
        if (!user?.email) return;

        const html = orderInvoiceEmail({
          customerName: checkoutSummary.deliveryAddress.fullName,
          orderId: order._id,
          amount: order.finalAmount,
          paymentMethod: "Cash on Delivery",
          address: `
            ${checkoutSummary.deliveryAddress.addressLine},
            ${checkoutSummary.deliveryAddress.city},
            ${checkoutSummary.deliveryAddress.state}
            - ${checkoutSummary.deliveryAddress.pincode}
          `,
        });

        await sendEmail(
          user.email,
          `Order Confirmed – Cash on Delivery | Invoice #${order._id}`,
          {
            text: `Your COD order ${order._id} has been placed successfully. Pay ₹${order.finalAmount} at delivery.`,
            html,
          }, process.env.SMTP_FROM_ADMIN
        );

        const adminEmail = process.env.ADMIN_EMAIL_ORDER ;

        if (adminEmail) {
          const adminHtml = adminOrderEmail({
            type: "PLACED",
            orderId: order._id,
            customerName: checkoutSummary.deliveryAddress.fullName,
            amount: order.finalAmount,
            paymentMethod: order.paymentMethod,
          });

          await sendEmail(
            adminEmail,
            `🛒 New Order Placed | ${order._id}`,
            {
              text: `New order placed. Order ID: ${order._id}`,
              html: adminHtml,
            },  process.env.SMTP_FROM_ADMIN // ✅ ADMIN SENDER

          );
        }


        console.log("✅ COD ORDER EMAIL SENT:", user.email);
      } catch (emailErr) {
        console.error("❌ COD EMAIL FAILED:", emailErr.message);
      }
    });

  } catch (err) {
    console.error("❌ COD ORDER ERROR:", err);

    // ⚠️ Prevent double response
    if (!res.headersSent) {
      res.status(400).json({
        message: err.message || "Failed to place COD order",
      });
    }
  }
};



// exports.cancelCODOrder = async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       _id: req.params.orderId,
//       userId: req.user.id
//     });

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     if (order.paymentMethod !== "COD") {
//       return res.status(400).json({ message: "Only COD orders can be cancelled here" });
//     }

//     if (order.orderStatus === "CANCELLED") {
//   return res.status(400).json({
//     message: "Order is already cancelled"
//   });
// }

//     if (["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)) {
//       return res.status(400).json({ message: "Order cannot be cancelled now" });
//     }

//     order.orderStatus = "CANCELLED";
//     order.paymentStatus = "CANCELLED";

//     await order.save();

//       const user = await User.findById(req.user.id);

//       if (user?.email) {
//         await sendEmail(
//           user.email,
//           `Order Cancelled | ${order._id}`,
//           `Hi ${order.deliveryAddress.fullName},

//       Your Cash on Delivery order has been cancelled successfully.

//       No payment was charged.`
//         );
//       }

//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

exports.cancelCODOrder = async (req, res) => {
  try {
    // 1️⃣ Find order
    const order = await Order.findOne({
      _id: req.params.orderId,
      userId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Validate COD
    if (order.paymentMethod !== "COD") {
      return res.status(400).json({
        message: "Only COD orders can be cancelled here",
      });
    }

    if (order.orderStatus === "CANCELLED") {
      return res.status(400).json({
        message: "Order is already cancelled",
      });
    }

    if (["OUT_FOR_DELIVERY", "DELIVERED"].includes(order.orderStatus)) {
      return res.status(400).json({
        message: "Order cannot be cancelled now",
      });
    }

    // 3️⃣ Cancel order
    order.orderStatus = "CANCELLED";
    order.paymentStatus = "CANCELLED";
    await order.save();

    // 4️⃣ RESPOND FIRST (⚡ low latency)
    res.status(200).json({
      message: "Order cancelled successfully",
      order,
    });

    // 5️⃣ SEND EMAIL ASYNC (non-blocking)
    setImmediate(async () => {
      try {
        const user = await User.findById(req.user.id);
        if (!user?.email) return;

        const html = `
          <div style="font-family:Arial,sans-serif;background:#f6f8fa;padding:20px">
            <div style="max-width:600px;margin:auto;background:#fff;padding:24px;border-radius:8px">
              <h2 style="color:#2f855a;margin:0">Phoolpatta</h2>
              <p style="color:#777;font-size:13px">Order Cancellation</p>

              <p>Hi <strong>${order.deliveryAddress.fullName}</strong>,</p>

              <p>
                Your <strong>Cash on Delivery</strong> order has been
                <span style="color:#e53e3e;font-weight:bold">cancelled</span>
                successfully.
              </p>

              <table width="100%" style="font-size:14px;margin:16px 0">
                <tr>
                  <td><strong>Order ID</strong></td>
                  <td align="right">${order._id}</td>
                </tr>
                <tr>
                  <td><strong>Payment</strong></td>
                  <td align="right">Cash on Delivery</td>
                </tr>
                <tr>
                  <td><strong>Status</strong></td>
                  <td align="right">Cancelled</td>
                </tr>
              </table>

              <p style="font-size:13px;color:#555">
                No payment was charged for this order.
              </p>

              <hr style="border:none;border-top:1px solid #eee;margin:20px 0"/>

              <p style="font-size:12px;color:#777">
                Need help? Contact
                <a href="mailto:phoolpattta@gmail.com">phoolpattta@gmail.com</a>
              </p>

              <p style="font-size:12px;color:#999">
                © ${new Date().getFullYear()} Phoolpatta · phoolpatta.com
              </p>
            </div>
          </div>
        `;

        await sendEmail(
          user.email,
          `Order Cancelled | ${order._id}`,
          {
            text: `Your COD order ${order._id} has been cancelled. No payment was charged.`,
            html,
          },process.env.SMTP_FROM_ADMIN
        );

      const adminEmail = process.env.ADMIN_EMAIL_ORDER;

      if (adminEmail) {
        const adminHtml = adminOrderEmail({
          type: "CANCELLED",
          orderId: order._id,
          customerName: order.deliveryAddress.fullName,
          paymentMethod: "Cash on Delivery",
        });

        await sendEmail(
          adminEmail,
          `❌ Order Cancelled | ${order._id}`,
          {
            text: `Order cancelled. Order ID: ${order._id}`,
            html: adminHtml,
          },
          process.env.SMTP_FROM_ADMIN // ✅ ADMIN SENDER
        );
      }


        console.log("✅ COD CANCELLATION EMAIL SENT:", user.email);
      } catch (emailErr) {
        console.error("❌ COD CANCEL EMAIL FAILED:", emailErr.message);
      }
    });

  } catch (err) {
    console.error("❌ CANCEL COD ERROR:", err);

    if (!res.headersSent) {
      res.status(500).json({
        message: err.message || "Failed to cancel COD order",
      });
    }
  }
};

/* =========================
   ADMIN: GET SINGLE ORDER
========================= */
const mongoose = require("mongoose");

/* =========================
   ADMIN: GET SINGLE ORDER
========================= */
exports.getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ VALIDATE OBJECT ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid order ID"
      });
    }

    const order = await Order.findById(id)
      .populate("userId", "name email phone");

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
