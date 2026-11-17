# Inventory & Data Management System

## Run
1. Start MongoDB locally (or put an Atlas URI in `.env`)
2. `npm install`
3. `npm run seed`   (optional sample data)
4. `npm start`

## Endpoints
| Method | URL | Purpose |
|---|---|---|
| POST | /api/products | Create product |
| GET | /api/products | List (filter, sort, paginate) |
| GET | /api/products/:id | Single product |
| PUT | /api/products/:id | Update details |
| PATCH | /api/products/:id/stock | `{ "change": 10 }` restock / `{ "change": -3 }` sale |
| DELETE | /api/products/:id | Delete |
| GET | /api/products/low-stock | quantity <= reorderLevel |
| GET | /api/products/summary | Category-wise aggregation |

Query examples:
`/api/products?category=Electronics&minPrice=500&maxPrice=5000&sort=-price&page=1&limit=5`
`/api/products?search=pen&inStock=true`
