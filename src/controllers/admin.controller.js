const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

/* =========================
   ADMIN DASHBOARD STATS
========================= */
exports.getDashboardStats = async (req, res) => {
  try {
    const { range } = req.query;

    let dateFilter = {};
    const now = new Date();

    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      dateFilter.createdAt = { $gte: start };
    }

    if (range === "7d") {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      dateFilter.createdAt = { $gte: start };
    }

    if (range === "30d") {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      dateFilter.createdAt = { $gte: start };
    }

    /* =========================
       ORDERS
    ========================= */
    const totalOrders = await Order.countDocuments(dateFilter);

    const deliveredOrders = await Order.countDocuments({
      orderStatus: "DELIVERED",
      ...dateFilter,
    });

    const cancelledOrders = await Order.countDocuments({
      orderStatus: "CANCELLED",
      ...dateFilter,
    });

    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ["PLACED", "CONFIRMED", "OUT_FOR_DELIVERY"] },
      ...dateFilter,
    });

    /* =========================
       PAYMENTS
    ========================= */
    const paidOrders = await Order.countDocuments({
      paymentStatus: "PAID",
      ...dateFilter,
    });

    const codOrders = await Order.countDocuments({
      paymentMethod: "COD",
      ...dateFilter,
    });

    /* =========================
       REVENUE (PAID + DELIVERED)
    ========================= */

    const revenueAgg = await Order.aggregate([
  {
    $match: {
      paymentStatus: "PAID",
    },
  },
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$finalAmount" },
    },
  },
]);


    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    /* =========================
       PRODUCTS (NO DATE FILTER)
    ========================= */
    const totalProducts = await Product.countDocuments({});
    const activeProducts = await Product.countDocuments({ isActive: true });
    const inactiveProducts = await Product.countDocuments({ isActive: false });
    const outOfStock = await Product.countDocuments({ stock: 0 });

    /* =========================
       USERS
    ========================= */
    const totalUsers = await User.countDocuments({ role: "USER" });

    res.json({
      orders: {
        total: totalOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
        pending: pendingOrders,
      },
      payments: {
        paid: paidOrders,
        cod: codOrders,
      },
      revenue: {
        total: totalRevenue,
      },
      products: {
        total: totalProducts,
        active: activeProducts,
        inactive: inactiveProducts,
        outOfStock,
      },
      users: {
        total: totalUsers,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
