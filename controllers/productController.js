const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

const SORTABLE = ["name", "price", "quantity", "category", "createdAt", "sku"];
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// GET /api/products?category=&supplier=&search=&minPrice=&maxPrice=&inStock=&sort=&page=&limit=
exports.getProducts = asyncHandler(async (req, res) => {
  const { category, supplier, search, minPrice, maxPrice, inStock, sort } = req.query;

  // ---- Filtering ----
  const filter = {};
  if (category) filter.category = category;
  if (supplier) filter.supplier = new RegExp(escapeRegex(supplier), "i");
  if (search) filter.name = new RegExp(escapeRegex(search), "i");
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (inStock === "true") filter.quantity = { $gt: 0 };
  if (inStock === "false") filter.quantity = 0;

  // ---- Sorting: ?sort=-price,name (prefix - = descending) ----
  let sortBy = "-createdAt";
  if (sort) {
    const fields = sort.split(",").filter((f) => SORTABLE.includes(f.replace(/^-/, "")));
    if (fields.length) sortBy = fields.join(" ");
  }

  // ---- Pagination ----
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortBy)
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ total, page, totalPages: Math.ceil(total / limit), count: products.length, products });
});

// GET /api/products/:id
exports.getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

// PATCH /api/products/:id/stock   body: { "change": 10 } restock, { "change": -3 } sale
exports.adjustStock = asyncHandler(async (req, res) => {
  const { change } = req.body;
  if (!Number.isInteger(change) || change === 0) {
    return res.status(400).json({ error: "'change' must be a non-zero integer (positive = restock, negative = sale)" });
  }

  // Atomic: the quantity check and the $inc happen in ONE database operation,
  // so two simultaneous sales can never push stock below zero.
  const filter = { _id: req.params.id };
  if (change < 0) filter.quantity = { $gte: -change };

  const product = await Product.findOneAndUpdate(filter, { $inc: { quantity: change } }, { new: true });

  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    if (!exists) return res.status(404).json({ error: "Product not found" });
    return res.status(400).json({ error: "Insufficient stock for this sale" });
  }
  res.json({ message: "Stock updated", product });
});

// DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ message: "Product deleted", id: product._id });
});

// GET /api/products/low-stock  (aggregation)
exports.getLowStock = asyncHandler(async (req, res) => {
  const lowStockItems = await Product.aggregate([
    { $match: { $expr: { $lte: ["$quantity", "$reorderLevel"] } } },
    { $addFields: { stockValue: { $multiply: ["$price", "$quantity"] }, id: "$_id" } },
    { $sort: { quantity: 1 } },
  ]);
  res.json({ count: lowStockItems.length, lowStockItems });
});

// GET /api/products/summary  (aggregation)
exports.getCategorySummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        totalItems: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
        totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
        avgPrice: { $avg: "$price" },
      },
    },
    { $addFields: { avgPrice: { $round: ["$avgPrice", 2] } } },
    { $sort: { totalStockValue: -1 } },
  ]);
  res.json({ categories: summary.length, summary });
});
