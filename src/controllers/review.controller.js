const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

/* =========================
   ADD REVIEW
========================= */
exports.addReview = async (req, res) => {
  try {
    const { productId, rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // 1️⃣ Check if user purchased product
    const order = await Order.findOne({
      userId: req.user.id,
      "items.productId": productId,
      orderStatus: "DELIVERED"
    });

    if (!order) {
      return res.status(403).json({
        message: "You can review only products you have purchased"
      });
    }

    // 2️⃣ Create review
    const newReview = await Review.create({
      productId,
      userId: req.user.id,
      orderId: order._id,
      rating,
      review
    });

    // 3️⃣ Recalculate product rating
    const stats = await Review.aggregate([
      { $match: { productId: newReview.productId } },
      {
        $group: {
          _id: "$productId",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    await Product.findByIdAndUpdate(productId, {
      rating: stats[0].avgRating,
      reviewCount: stats[0].count
    });

    res.status(201).json({
      message: "Review added successfully",
      review: newReview
    });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product"
      });
    }
    res.status(500).json({ message: err.message });
  }
};
/* =========================
   GET PRODUCT REVIEWS
========================= */
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      productId: req.params.productId
    })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//edit review
exports.editReview = async (req, res) => {
  const { rating, review } = req.body;

  const updated = await Review.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { rating, review },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return res.status(404).json({ message: "Review not found" });
  }

  res.json({ message: "Review updated", review: updated });
};


//delete review 
exports.deleteReview = async (req, res) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });

  if (!review) {
    return res.status(404).json({ message: "Review not found" });
  }

  res.json({ message: "Review deleted" });
};
