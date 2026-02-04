const User = require("../models/User");

/* =========================
   GET USER PROFILE
========================= */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -__v"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =========================
   UPDATE USER PROFILE
========================= */
exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ["name", "phone", "address", "gender"];
    const updates = {};

    // Only allow whitelisted fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password -__v");

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (err) {
    // Handle duplicate phone error
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Phone number already in use"
      });
    }

    res.status(500).json({ message: err.message });
  }
};



/* =========================
   GET ALL USERS (ADMIN)
========================= */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -__v")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   GET USER BY ID (ADMIN)
========================= */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* =========================
   BLOCK / UNBLOCK USER
========================= */
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent blocking admin
    if (user.role === "ADMIN") {
      return res.status(400).json({
        message: "Admin user cannot be blocked",
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      isBlocked: user.isBlocked,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
