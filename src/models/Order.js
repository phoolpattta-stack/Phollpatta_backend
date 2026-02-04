// // const mongoose = require("mongoose");

// // const orderSchema = new mongoose.Schema(
// //   {
// //     userId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //       required: true
// //     },

// //     items: [
// //       {
// //         productId: {
// //           type: mongoose.Schema.Types.ObjectId,
// //           ref: "Product"
// //         },
// //         name: String,
// //         price: Number,
// //         quantity: Number,
// //         total: Number
// //       }
// //     ],

// //     deliveryAddress: {
// //       fullName: String,
// //       phone: String,
// //       street: String,
// //       city: String,
// //       state: String,
// //       pincode: String,
// //       country: String
// //     },

// //     subtotal: Number,
// //     discount: Number,
// //     finalAmount: Number,


// //     paymentMethod: {
// //       type: String,
// //       enum: ["ONLINE", "COD"],
// //       required: true
// //     },

// //       paymentStatus: {
// //         type: String,
// //         enum: ["PAID", "PENDING", "FAILED","CANCELLED"],
// //         default: "PENDING"
// //       },

// //     orderStatus: {
// //       type: String,
// //       enum: ["PLACED", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
// //       default: "PLACED"
// //     }
// //   },
// //   { timestamps: true }
// // );

// // module.exports = mongoose.model("Order", orderSchema);


// const mongoose = require("mongoose");

// const orderSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },
//   items: [{
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true
//     },
//     name: {
//       type: String,
//       required: true
//     },
//     price: {
//       type: Number,
//       required: true
//     },
//     quantity: {
//       type: Number,
//       required: true
//     },
//     total: {
//       type: Number,
//       required: true
//     }
//   }],
//   subtotal: {
//     type: Number,
//     required: true
//   },
//   discount: {
//     type: Number,
//     default: 0
//   },
//   finalAmount: {
//     type: Number,
//     required: true
//   },
//   deliveryAddress: {
//     fullName: { type: String, required: true },
//     phone: { type: String, required: true },
//     street: { type: String, required: true },
//     city: { type: String, required: true },
//     state: { type: String, required: true },
//     pincode: { type: String, required: true },
//     country: { type: String, default: "India" }
//   },
//   paymentMethod: {
//     type: String,
//     enum: ["COD", "RAZORPAY"],
//     required: true
//   },
//   paymentStatus: {
//     type: String,
//     enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
//     default: "PENDING"
//   },
//   orderStatus: {
//     type: String,
//     enum: ["PLACED", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
//     default: "PLACED"
//   },
//   razorpayOrderId: String,
//   razorpayPaymentId: String
// }, {
//   timestamps: true
// });

// module.exports = mongoose.model("Order", orderSchema);

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    total: {
      type: Number,
      required: true
    },
    image: {
      type: String
    }
  }],
  subtotal: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    fullName: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      required: true,
    },
    street: { 
      type: String, 
      required: true 
    },
    city: { 
      type: String, 
      required: true 
    },
    state: { 
      type: String, 
      required: true 
    },
    pincode: { 
      type: String, 
      required: true 
    },
    country: { 
      type: String, 
      default: "India" 
    }
  },
  paymentMethod: {
    type: String,
    enum: ["COD", "RAZORPAY"],
    required: true,
    index: true // For filtering
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID", "FAILED", "CANCELLED"],
    default: "PENDING",
    index: true // For filtering
  },
  orderStatus: {
    type: String,
    enum: ["PLACED", "CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"],
    default: "PLACED",
    index: true // For filtering
  },
  razorpayOrderId: {
    type: String,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    index: true
  },
  // Optional: Track status changes
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }],
  // Optional: Cancellation reason
  cancellationReason: {
    type: String
  },
  // Optional: Delivery tracking
  deliveryDate: {
    type: Date
  },
  trackingNumber: {
    type: String
  }
}, {
  timestamps: true // ✅ This adds createdAt and updatedAt automatically
});

// ✅ Add indexes for better query performance
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentMethod: 1, paymentStatus: 1 });
orderSchema.index({ "deliveryAddress.phone": 1 });

// ✅ Virtual for payment method display
orderSchema.virtual('paymentMethodDisplay').get(function() {
  return this.paymentMethod === 'RAZORPAY' ? 'ONLINE' : this.paymentMethod;
});

// ✅ Ensure virtuals are included when converting to JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// ✅ Pre-save hook to update status history
// orderSchema.pre('save', function(next) {
//   if (this.isModified('orderStatus')) {
//     this.statusHistory.push({
//       status: this.orderStatus,
//       timestamp: new Date()
//     });
//   }
//   next();
// });

module.exports = mongoose.model("Order", orderSchema);