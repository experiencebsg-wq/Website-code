# BSG Fragrance API (Backend)

Node.js + Express + Prisma (SQLite) API for the BSG Fragrance e-commerce store.

## Setup

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Environment**
   - Copy `server/.env.example` to `server/.env` (or create `server/.env` with at least `DATABASE_URL`).
   - For SQLite: `DATABASE_URL="file:./dev.db"` (path is relative to `server/prisma/`).
   - `PAYSTACK_SECRET_KEY`: optional; use `sk_test_...` or `sk_live_...` for real verification. Leave empty for dev (any reference accepted).
   - **Contact form email (Resend):** `RESEND_API_KEY` (from [resend.com/api-keys](https://resend.com/api-keys)); optional `CONTACT_EMAIL_TO` = email address that receives contact form submissions. If both are set, each submission sends you an email. Use `RESEND_FROM` to override the sender (e.g. `Aura <noreply@yourdomain.com>`); default is Resend’s test sender.

3. **Database** (required before first run)
   ```bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```
   Seed creates:
   - Admin user: **admin@bsgfragrance.com** / **admin123**
   - 18 sample products

4. **Run**
   ```bash
   npm run dev
   ```
   API runs at **http://localhost:3001**. You should see: `BSG API running at http://localhost:3001`.

**Quick check:** Open http://localhost:3001/health — you should get `{"ok":true}`. Then try http://localhost:3001/products — you should get a JSON array of products (or `[]` if DB is empty and not seeded).

## Frontend

In the project root, create `.env` with:
```env
VITE_API_BASE_URL=http://localhost:3001
```
Then run the frontend: `npm run dev` (port 8080). The store will use the real API; if the API is down, the frontend falls back to mock data.

## API

- **GET** `/products` – list products (query: `category`, `featured`, `search`, `minPrice`, `maxPrice`, `sort`)
- **GET** `/products/featured` – featured products
- **GET** `/products/:id` – product by id or slug
- **POST** `/checkout` – create order (after payment)
- **GET** `/payments/verify/:reference` – verify Paystack payment
- **POST** `/contact` – submit contact form
- **POST** `/auth/login` – admin login (body: `{ "email", "password" }`)
- **GET** `/auth/me` – current admin (header: `Authorization: Bearer <token>`)

### Admin (require `Authorization: Bearer <token>`)

- **GET** `/admin/products` – list products
- **POST** `/admin/products` – create product
- **PUT** `/admin/products/:id` – update product
- **DELETE** `/admin/products/:id` – delete product
- **GET** `/admin/orders` – list orders (query: `status`)
- **GET** `/admin/orders/:id` – order detail
- **PATCH** `/admin/orders/:id` – update order status (body: `{ "status" }`)
- **GET** `/admin/contacts` – list contact messages
- **PATCH** `/admin/contacts/:id/read` – mark message read

## Paystack

Set `PAYSTACK_SECRET_KEY` in `server/.env` for server-side payment verification. If unset, verification always succeeds (dev only).
