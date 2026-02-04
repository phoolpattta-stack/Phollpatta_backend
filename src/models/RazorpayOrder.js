const mongoose = require("mongoose");

const razorpayOrderSchema = new mongoose.Schema({
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  checkoutSummary: {
    items: [{
      productId: String,
      name: String,
      price: Number,
      quantity: Number,
      total: Number,
      image: String
    }],
    subtotal: Number,
    discount: Number,
    finalAmount: Number,
    deliveryAddress: {
      fullName: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: String
    }
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["CREATED", "PAID", "FAILED"],
    default: "CREATED"
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("RazorpayOrder", razorpayOrderSchema);