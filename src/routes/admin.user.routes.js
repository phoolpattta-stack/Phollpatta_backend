const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const {
  getAllUsers,
  getUserById,
  toggleUserStatus,
} = require("../controllers/user.controller");

router.get(
  "/users",
  protect,
  authorize("ADMIN"),
  getAllUsers
);

router.get(
  "/users/:id",
  protect,
  authorize("ADMIN"),
  getUserById
);

router.patch(
  "/users/:id/toggle",
  protect,
  authorize("ADMIN"),
  toggleUserStatus
);

module.exports = router;
