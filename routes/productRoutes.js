const express = require("express");
const c = require("../controllers/productController");
const { validateObjectId, validateBody } = require("../middleware/validate");

const router = express.Router();

// Static routes MUST come before "/:id", otherwise "low-stock" is treated as an ID
router.get("/low-stock", c.getLowStock);
router.get("/summary", c.getCategorySummary);

router.route("/").get(c.getProducts).post(validateBody, c.createProduct);

router
  .route("/:id")
  .get(validateObjectId, c.getProductById)
  .put(validateObjectId, validateBody, c.updateProduct)
  .delete(validateObjectId, c.deleteProduct);

router.patch("/:id/stock", validateObjectId, validateBody, c.adjustStock);

module.exports = router;
