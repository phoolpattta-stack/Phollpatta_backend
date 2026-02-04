const Coupon = require("../models/Coupon");

// CREATE
exports.createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create(req.body);

    res.status(201).json({
      message: "Coupon created successfully",
      coupon
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET ALL
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    res.json({
      message: "Coupon updated",
      coupon
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    res.json({ message: "Coupon deleted" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// TOGGLE ACTIVE
exports.toggleCouponStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.json({
      message: coupon.isActive ? "Coupon Enabled" : "Coupon Disabled",
      isActive: coupon.isActive
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
