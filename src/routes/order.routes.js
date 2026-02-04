


const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  createCODOrder,
  cancelCODOrder,getAdminOrderById
} = require("../controllers/order.controller");

/* ===== ADMIN FIRST ===== */
router.get("/admin/all", protect, authorize("ADMIN"), getAllOrders);
router.patch("/admin/:id/status", protect, authorize("ADMIN"), updateOrderStatus);
router.get(
  "/admin/:id",
   protect, authorize("ADMIN"),
  getAdminOrderById
);

/* ===== USER ===== */
router.post("/create", protect, createOrder);
router.get("/my", protect, getMyOrders);
router.get("/:id", protect, getOrderById);
router.post("/create-cod", protect, createCODOrder);
router.post("/:orderId/cancel", protect, cancelCODOrder);


module.exports = router;
