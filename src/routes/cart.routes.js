const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const {
  addToCart,
  getUserCart,
  updateQuantity,
  removeItem
} = require("../controllers/cart.controller");

router.use(protect);

router.get("/", getUserCart);
router.post("/add", addToCart);
router.put("/update", updateQuantity);
router.delete("/remove/:productId", removeItem);

module.exports = router;
