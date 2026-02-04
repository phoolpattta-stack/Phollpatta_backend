const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.getCart = async (userId) => {
  let cart = await Cart.findOne({ userId }).populate("items.productId");

  if (!cart) {
    cart = await Cart.create({ userId, items: [], totalAmount: 0 });
  }

  return cart;
};

exports.recalculateCart = async (cart) => {
  let total = 0;

  for (let item of cart.items) {
    const product = await Product.findById(item.productId);

    if (!product || !product.isActive || product.stock < item.quantity) {
      item.quantity = 0;
    } else {
      item.priceSnapshot = product.price;
      total += product.price * item.quantity;
    }
  }

  cart.items = cart.items.filter(i => i.quantity > 0);
  cart.totalAmount = total;

  await cart.save();
  return cart;
};
