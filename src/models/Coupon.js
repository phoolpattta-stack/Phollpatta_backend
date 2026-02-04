// const mongoose = require("mongoose");

// const couponSchema = new mongoose.Schema(
//   {
//     code: {
//       type: String,
//       required: true,
//       unique: true,
//       uppercase: true,
//       trim: true
//     },

//     type: {
//       type: String,
//       enum: ["FLAT", "PERCENT"],
//       required: true
//     },

//     value: {
//       type: Number,
//       required: true
//     },

//     minAmount: {
//       type: Number,
//       default: 0
//     },

//     maxDiscount: {
//       type: Number,
//       default: null   // only used for percent coupons
//     },

//     expiry: {
//       type: Date,
//       required: true
//     },

//     isActive: {
//       type: Boolean,
//       default: true
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Coupon", couponSchema);
const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    type: {
      type: String,
      enum: ["FLAT", "PERCENT"],
      required: true
    },

    value: {
      type: Number,
      required: true
    },

    minAmount: {
      type: Number,
      default: 0
    },

    maxDiscount: {
      type: Number,
      default: null
    },

    expiry: {
      type: Date,
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    // ✅ ADD THIS
    usedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
