exports.notFound = (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
};

exports.errorHandler = (err, req, res, next) => {
  // Mongoose schema validation failed
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(400).json({ error: "Validation failed", details });
  }
  // Bad ObjectId / wrong type
  if (err.name === "CastError") {
    return res.status(400).json({ error: `Invalid value for ${err.path}` });
  }
  // Duplicate key (unique SKU)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ error: `Duplicate value: ${field} '${err.keyValue?.[field]}' already exists` });
  }
  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Malformed JSON in request body" });
  }
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
};
