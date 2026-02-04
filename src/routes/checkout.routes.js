const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { checkoutSummary } = require("../controllers/checkout.controller");

router.post("/summary", protect, checkoutSummary);

module.exports = router;
