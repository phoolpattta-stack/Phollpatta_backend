const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { getCart, recalculateCart } = require("../services/cart.service");

/* ============= ADD TO CART ================= */

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    let { productId, quantity } = req.body;

    quantity = Number(quantity) || 1;

    // 1️⃣ Validate product
    const product = await Product.findById(productId);
    if (!product || !product.isActive)
      return res.status(404).json({ message: "Product not found" });

    if (product.stock < quantity)
      return res.status(400).json({ message: "Out of stock" });

    // 2️⃣ Try incrementing quantity if product already exists
    let cart = await Cart.findOneAndUpdate(
      {
        userId,
        "items.productId": productId
      },
      {
        $inc: { "items.$.quantity": quantity }
      },
      { new: true }
    );

    // 3️⃣ If product not in cart, push new item
    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        { userId },
        {
          $push: {
            items: {
              productId,
              quantity,
              priceSnapshot: product.price
            }
          }
        },
        { new: true, upsert: true }
      );
    }

    // 4️⃣ Recalculate totals
    await recalculateCart(cart);

    res.json({
      message: "Item added to cart",
      cart
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ============= GET CART ================= */
exports.getUserCart = async (req, res) => {
  try {
    const cart = await getCart(req.user.id);
    await recalculateCart(cart);

    res.json(cart);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ============= UPDATE QUANTITY ================= */
exports.updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await getCart(req.user.id);

    const item = cart.items.find(i => {
      const pid = i.productId._id ? i.productId._id.toString() : i.productId.toString();
      return pid === productId;
    });

    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    // check product stock
    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(400).json({ message: "Product unavailable now" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Only ${product.stock} items available`
      });
    }

    item.quantity = quantity;

    await recalculateCart(cart);

    res.json({
      message: "Cart updated",
      cart
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/* ============= REMOVE ITEM ================= */
exports.removeItem = async (req, res) => {
  try {
    const cart = await getCart(req.user.id);

    cart.items = cart.items.filter(i => {
    const pid = i.productId._id ? i.productId._id.toString() : i.productId.toString();
    return pid !== req.params.productId;
    });



    await recalculateCart(cart);

    res.json({
      message: "Item removed",
      cart
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
