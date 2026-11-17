// Optional: fills the DB with 12 sample products across 5 categories
require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");

const data = [
  { name: "Study Table", sku: "FURN-TB-812", category: "Furniture", price: 3999, quantity: 2, reorderLevel: 4, supplier: "IKEA India" },
  { name: "Office Chair", sku: "FURN-CH-101", category: "Furniture", price: 5499, quantity: 15, reorderLevel: 5, supplier: "Godrej" },
  { name: "Laptop 15-inch", sku: "ELEC-LP-001", category: "Electronics", price: 55000, quantity: 5, reorderLevel: 3, supplier: "Dell" },
  { name: "Wireless Mouse", sku: "ELEC-MS-002", category: "Electronics", price: 799, quantity: 60, reorderLevel: 20, supplier: "Logitech" },
  { name: "Bluetooth Speaker", sku: "ELEC-SP-003", category: "Electronics", price: 2499, quantity: 8, reorderLevel: 10, supplier: "boAt" },
  { name: "USB-C Cable", sku: "ELEC-CB-004", category: "Electronics", price: 299, quantity: 23, reorderLevel: 15, supplier: "Anker" },
  { name: "Cotton T-Shirt", sku: "APRL-TS-201", category: "Apparel", price: 499, quantity: 50, reorderLevel: 20, supplier: "Allen Solly" },
  { name: "Denim Jeans", sku: "APRL-JN-202", category: "Apparel", price: 2299, quantity: 28, reorderLevel: 10, supplier: "Levi's" },
  { name: "Gel Pen Pack of 15", sku: "STNY-PN-713", category: "Stationery", price: 120, quantity: 40, reorderLevel: 20, supplier: "Cello Pens" },
  { name: "A4 Notebook", sku: "STNY-NB-714", category: "Stationery", price: 80, quantity: 6, reorderLevel: 25, supplier: "Classmate" },
  { name: "Basmati Rice 5kg", sku: "GROC-RC-301", category: "Grocery", price: 650, quantity: 30, reorderLevel: 10, supplier: "India Gate" },
  { name: "Olive Oil 1L", sku: "GROC-OL-302", category: "Grocery", price: 899, quantity: 4, reorderLevel: 8, supplier: "Figaro" },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Product.deleteMany({});
  await Product.insertMany(data);
  console.log(`Seeded ${data.length} products`);
  process.exit(0);
})();
