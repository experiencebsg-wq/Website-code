# Current setup & Neon database migration

This document confirms how the BSG site is set up and gives step-by-step Neon setup from where you are now.

---

## 1. Current setup (confirmed)

### GitHub

| Item | Value |
|------|--------|
| **Repo** | `experiencebsg-wq/Website-code` |
| **Remote** | `git@github.com:experiencebsg-wq/Website-code.git` (or `https://github.com/experiencebsg-wq/Website-code.git`) |
| **Branch** | `main` (default) |

Pushing to `main` triggers deploys on Vercel (storefront + admin) and Render (API). No other branches or remotes are required for deployment.

---

### What lives where

| Part | Host | Repo path | Purpose |
|------|------|-----------|---------|
| **Storefront** | Vercel | repo root | Public site (www.experiencebsg.com) |
| **Admin** | Vercel | `admin/` | Admin panel (admin.experiencebsg.com) |
| **API** | Render (Web Service) | `server/` | Node/Express + Prisma, serves products, orders, contact, newsletter, auth, payments |
| **Database** | Render PostgreSQL → **moving to Neon** | — | PostgreSQL used by API via `DATABASE_URL` |

---

### Storefront (Vercel – root)

- **Root directory:** (default, repository root)
- **Build:** `npm run build` → output `dist`
- **Framework:** Vite (from root `package.json`)
- **Env (set in Vercel dashboard):**
  - `VITE_API_BASE_URL` = your Render API URL (e.g. `https://aura-fragrance-api.onrender.com`) — no trailing slash
  - `VITE_PAYSTACK_PUBLIC_KEY` = Paystack public key
- **Config:** `vercel.json` — SPA fallback, `sitemap.xml` / `robots.txt` served with correct headers
- **Canonical / SEO:** `index.html` and `src/components/SEO.tsx` use `https://www.experiencebsg.com`

---

### Admin (Vercel – separate project)

- **Root directory:** `admin`
- **Build:** `npm run build` → output `dist`
- **Framework:** Vite (from `admin/package.json`)
- **Env (set in Vercel dashboard):**
  - `VITE_API_BASE_URL` = same Render API URL as storefront
- **Favicon:** Points to `https://www.experiencebsg.com/favicon.png`

---

### API (Render – Web Service)

- **Root directory:** `server`
- **Runtime:** Node
- **Install:** `npm install --include=dev`
- **Build:** `npx prisma generate && npm run build && npx prisma db push`
- **Start:** `npm start` (runs `node dist/index.js`)
- **Env (set in Render dashboard → your API service → Environment):**

| Key | Purpose |
|-----|---------|
| `DATABASE_URL` | PostgreSQL connection string (currently Render DB → will be Neon) |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Secret for admin login tokens |
| `FRONTEND_URL` | Comma-separated origins for CORS, e.g. `https://www.experiencebsg.com,https://admin.experiencebsg.com` |
| `PAYSTACK_SECRET_KEY` | Paystack secret (verify payments) |
| Optional: `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, etc. | For contact form email |

---

### Database (currently Render, moving to Neon)

- **Current:** Render PostgreSQL service (`website-code-db`), expiring on **2026-03-11**.
- **Used by:** Only the API; Prisma reads `DATABASE_URL` from the environment (`server/prisma/schema.prisma`).
- **Code:** No hardcoded DB URLs; only `env("DATABASE_URL")` in schema. Changing the URL in Render’s env is enough.

---

## 2. Neon setup from your current setup

Do this **before** 2026-03-11 so the API keeps working after Render DB is suspended.

### Step 1 – Create Neon project and get connection string

1. Go to **https://neon.tech** and sign in (or sign up).
2. Click **New Project**.
3. Choose a name (e.g. `website-code`), region (pick one close to your Render region), and click **Create project**.
4. Neon creates a default database (e.g. `neondb`). On the project dashboard you’ll see **Connection string**.
5. Copy the **Pooled connection** string (recommended for serverless/Render). It looks like:
   ```text
   postgresql://USER:PASSWORD@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```
   Keep this for Step 4. You can also copy the **Direct** string if you prefer (Prisma works with both).

---

### Step 2 – Copy data from Render to Neon

**Option A – Node script (no PostgreSQL tools needed)**

1. Create the empty schema on Neon first. In PowerShell, from the **repo root**:
   ```powershell
   cd server
   $env:DATABASE_URL = "postgresql://YOUR_NEON_CONNECTION_STRING"
   npx prisma db push
   ```
   (Use your Neon URL from Step 1. This creates empty tables on Neon.)

2. Install the script dependency and run the migration (use your real Render and Neon URLs; do not commit them):
   ```powershell
   npm install
   $env:RENDER_DATABASE_URL = "postgresql://...Render External URL..."
   $env:NEON_DATABASE_URL  = "postgresql://...Neon connection string..."
   npx tsx scripts/migrate-render-to-neon.ts
   ```
   You should see each table and row count. Then go to Step 4.

**Option B – pg_dump / pg_restore (if PostgreSQL is installed)**

1. In **Render** → **website-code-db** → **Connect** → copy **External Database URL**.
2. From the repo root (PowerShell), if `pg_dump` is in PATH:
   ```powershell
   pg_dump "postgresql://USER:PASS@HOST/DB?sslmode=require" --no-owner --no-acl -F c -f server/render_backup.dump
   ```
   If not in PATH, use the full path, e.g. `& "C:\Program Files\PostgreSQL\16\bin\pg_dump.exe" "URL" ...`.
3. Import into Neon:
   ```powershell
   pg_restore -d "postgresql://...Neon URL..." --no-owner --no-acl server/render_backup.dump
   ```
4. Optional: In Neon SQL Editor run `SELECT COUNT(*) FROM "Product";` to confirm.

---

### Step 4 – Point the API to Neon

1. In **Render** → open your **Web Service** (the API, **not** the database).
2. Go to **Environment**.
3. Find **`DATABASE_URL`** and set it to the **Neon connection string** from Step 1 (Pooled or Direct, same format as above).
4. Save. Render will redeploy the API; it will then use Neon instead of Render Postgres.

No code changes or GitHub pushes are needed. Only this env var changes.

---

### Step 5 – Verify

1. Open **www.experiencebsg.com** — products and cart should work.
2. Open **admin.experiencebsg.com** — log in, check products, orders, mailing list.
3. Optionally: place a test order or subscribe to the newsletter, then confirm in the admin and in Neon’s SQL Editor that new data appears.
4. When everything looks good, you can **delete the Render PostgreSQL service** (website-code-db) so it’s not suspended or billed.

---

### Step 6 – Local development (optional)

- In **`server/.env`** you can set `DATABASE_URL` to:
  - The same Neon connection string (use with care so you don’t mess up production), or
  - A second Neon branch/database for local-only use.
- Root `.env` and `admin/.env`: `VITE_API_BASE_URL=http://localhost:3001` when running the API locally.

---

## 3. Summary

| Topic | Detail |
|-------|--------|
| **GitHub** | Repo `experiencebsg-wq/Website-code`, branch `main`. Push = auto deploy storefront, admin, API. |
| **Storefront** | Vercel, root, env: `VITE_API_BASE_URL`, `VITE_PAYSTACK_PUBLIC_KEY`. |
| **Admin** | Vercel, `admin/`, env: `VITE_API_BASE_URL`. |
| **API** | Render Web Service, `server/`, env: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PAYSTACK_SECRET_KEY`, etc. |
| **Database** | Today: Render. After migration: **Neon**. Only `DATABASE_URL` on Render (API service) and optionally `server/.env` for local. |
| **Neon** | Create project → copy connection string → pg_dump from Render → pg_restore into Neon → set `DATABASE_URL` on Render API → verify → delete Render DB when done. |

After you complete the Neon steps, the site runs for free with **Vercel (storefront + admin) + Render (API) + Neon (database)**.
