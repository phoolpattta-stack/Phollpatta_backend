const Product = require("../models/Product");
const { uploadProductImages } = require("../services/image.service");

exports.createProduct = async (req, res) => {
  console.log("REQ.FILES:", req.files.map(f => f.originalname));
  try {
    const { name, description, category, price, discount, stock } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "At least 1 image required" });
    }

    if (req.files.length > 5) {
      return res.status(400).json({ message: "Max 5 images allowed" });
    }

    const imageUrls = await uploadProductImages(req.files);

    const product = await Product.create({
      name,
      description,
      category,
      price,
      discount,
      stock,
      images: imageUrls,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    let updateData = req.body;

    // If new images uploaded -> upload to Cloudinary
    if (req.files && req.files.length > 0) {
      const imageUrls = await uploadProductImages(req.files);
      updateData.images = imageUrls;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      message: "Product updated successfully",
      product,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: product.isActive ? "Product Enabled" : "Product Disabled",
      isActive: product.isActive
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



/* =========================
   GET ALL ACTIVE PRODUCTS
========================= */
// exports.getAllProducts = async (req, res) => {
//   try {
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const category = req.query.category;
//     const search = req.query.search;

//     let filter = { isActive: true };

//     if (category) filter.category = category;

//     if (search) {
//       filter.name = { $regex: search, $options: "i" };
//     }

//     const products = await Product.find(filter)
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     const total = await Product.countDocuments(filter);

//     res.json({
//       total,
//       page,
//       limit,
//       pages: Math.ceil(total / limit),
//       products,
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
/* =========================
   ADMIN: GET ALL PRODUCTS
========================= */
exports.getAllProducts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const category = req.query.category;

    let filter = {}; // ❗ NO isActive filter

    if (category) filter.category = category;

    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET SINGLE PRODUCT BY ID
========================= */
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
