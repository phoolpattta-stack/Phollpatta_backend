
const { generateCheckoutSummary } = require("../services/checkout.service");

exports.checkoutSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    const { couponCode, address } = req.body;

    const data = await generateCheckoutSummary(userId, address, couponCode);

    res.json({
      message: "Checkout summary generated",
      ...data
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

