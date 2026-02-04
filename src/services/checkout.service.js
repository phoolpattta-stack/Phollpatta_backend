
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");

exports.generateCheckoutSummary = async (userId, address, couponCode = null) => {

  // 0️⃣ Validate Address
  if (
    !address ||
    !address.fullName ||
    !address.phone ||
    !address.state ||
    !address.pincode ||
    !address.country
  ) {
    throw new Error("Complete delivery address is required");
  }

  // 1️ Fetch Cart
  const cart = await Cart.findOne({ userId });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  let itemsSummary = [];
  let subtotal = 0;

  // Validate Products
  for (let item of cart.items) {
    const product = await Product.findById(item.productId);

    if (!product || !product.isActive) {
      throw new Error("One or more items are unavailable");
    }

    if (product.stock < item.quantity) {
      throw new Error(
        `Only ${product.stock} units available for ${product.name}`
      );
    }

    const itemTotal = product.price * item.quantity;
    subtotal += itemTotal;

    itemsSummary.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0] || null,
      price: product.price,
      quantity: item.quantity,
      total: itemTotal
    });
  }

  // 3️ Coupon Logic
  let discount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true
    });

    if (!coupon) throw new Error("Invalid coupon");
    if (coupon.expiry < new Date()) throw new Error("Coupon expired");
    if (subtotal < coupon.minAmount) {
      throw new Error(`Minimum order value must be ₹${coupon.minAmount}`);
    }

    if (coupon.type === "PERCENT") {
      discount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    }

    if (coupon.type === "FLAT") {
      discount = coupon.value;
    }
  }
  if(subtotal <= 499){
    subtotal += 1;
  }
  const finalAmount = subtotal - discount;

  if (finalAmount <= 0) {
    throw new Error("Invalid payable amount");
  }

  //Return Summary + Address
  return {
    summary: {
      items: itemsSummary,
      subtotal,
      discount,
      finalAmount,
      deliveryAddress: address
    }
  };
};
