const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    images: {
      type: [String],
      validate: [(arr) => arr.length <= 5, "Max 5 images allowed"],
    },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    stock: { type: Number, required: true },
    isActive: { type: Boolean, default: true },

        rating: {
      type: Number,
      default: 0
    },

    reviewCount: {
      type: Number,
      default: 0
    }

  },
  
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
