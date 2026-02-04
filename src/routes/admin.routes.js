// const express = require("express");
// const router = express.Router();

// const { protect } = require("../middlewares/auth.middleware");
// const { authorize } = require("../middlewares/role.middleware");

// router.get(
//   "/dashboard",
//   protect,
//   authorize("ADMIN"),
//   (req, res) => {const express = require("express");
// const router = express.Router();

// const { protect } = require("../middlewares/auth.middleware");
// const { authorize } = require("../middlewares/role.middleware");

// router.get(
//   "/dashboard",
//   protect,
//   authorize("ADMIN"),
//   (req, res) => {
//     res.json({ message: "Welcome Admin" });
//   }
// );

// module.exports = router;

//     res.json({ message: "Welcome Admin" });
//   }
// );

// module.exports = router;

const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const {
  getDashboardStats,
} = require("../controllers/admin.controller");

/* =========================
   ADMIN HOME (TEST ROUTE)
========================= */
// router.get(
//   "/dashboard",
//   protect,
//   authorize("ADMIN"),
//   (req, res) => {
//     res.json({ message: "Welcome Admin" });
//   }
// );

/* =========================
   ADMIN DASHBOARD STATS
========================= */
router.get(
  "/dashboard/stats",
  protect,
  authorize("ADMIN"),
  getDashboardStats
);

module.exports = router;
