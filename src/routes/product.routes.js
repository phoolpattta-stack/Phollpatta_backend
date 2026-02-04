const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");
const upload = require("../utils/multer");

const { createProduct, updateProduct,deleteProduct, toggleProductStatus } = require("../controllers/product.controller");
const { getAllProducts, getProductById} = require("../controllers/product.controller");


// Public product routes (User)
router.get("/", getAllProducts);
router.get("/:id", getProductById)

//private route for admin only
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  upload.array("images", 5),
  createProduct
);

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  upload.array("images", 5),
  updateProduct
);

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteProduct
);


router.patch(
  "/:id/status",
  protect,
  authorize("ADMIN"),
  toggleProductStatus
);


module.exports = router;
