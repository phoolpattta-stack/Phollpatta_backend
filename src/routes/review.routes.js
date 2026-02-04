const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");


const {
  addReview,
  getProductReviews,
  editReview,
  deleteReview,
} = require("../controllers/review.controller");

/* USER */
router.post("/", protect, addReview);
router.put("/:id", protect, editReview);
router.delete("/:id", protect, deleteReview);
/* PUBLIC */
router.get("/:productId", getProductReviews);

module.exports = router;
