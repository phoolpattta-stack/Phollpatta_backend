const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus
} = require("../controllers/coupon.controller");

router.use(protect);
router.use(authorize("ADMIN"));

router.post("/", createCoupon);
router.get("/", getAllCoupons);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
router.patch("/:id/status", toggleCouponStatus);

module.exports = router;
