# Deployment guide – Aura Fragrance (Vercel + Render)

Use this checklist and fill in your details as you go. Pushing to your connected GitHub repo will auto-deploy all three parts.

---

## Your details (fill these in)

| Item | Your value |
|------|------------|
| **GitHub repo URL** | `https://github.com/YOUR_USERNAME/YOUR_REPO.git` |
| **Storefront URL (Vercel)** | `https://_______________.vercel.app` |
| **Admin URL (Vercel)** | `https://_______________.vercel.app` |
| **API URL (Render)** | `https://_______________.onrender.com` |
| **Render Postgres Internal URL** | (from Render dashboard → your DB → Connect) |

---

## Part 1 – GitHub (one-time)

1. Create a new repo on GitHub (account you want to use with Vercel): https://github.com/new  
   - Name: e.g. `aura-fragrance`  
   - Do **not** add README / .gitignore (repo should be empty).

2. In a terminal, from this folder:
   ```bash
   cd C:\Users\ufuoma\Desktop\aura-fragrance-e-commerce-main
   git init
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git add .
   git commit -m "Initial commit for deployment"
   git branch -M main
   git push -u origin main
   ```
   Use the **same** GitHub account (or a token for that account) when pushing.

---

## Part 2 – Render: Database + API (one-time)

### 2.1 Create PostgreSQL database

1. Go to https://dashboard.render.com → **New +** → **PostgreSQL**.
2. Name: e.g. `aura-fragrance-db`, Region: choose closest.
3. Instance: **Free**. Create.
4. Open the database → **Connect** → copy **Internal Database URL**. Paste it into the “Your details” table above as **Render Postgres Internal URL**.

### 2.2 Create Web Service (API)

1. **New +** → **Web Service**.
2. Connect GitHub and select the **same** repo. Branch: `main`.
3. Settings:
   - **Name:** e.g. `aura-fragrance-api`
   - **Root Directory:** `server`
   - **Runtime:** Node
   - **Install Command:** `npm install --include=dev` (so TypeScript and @types are installed)
   - **Build Command:** `npx prisma generate && npm run build && npx prisma db push`
   - **Start Command:** `npm start`
   - **Important:** You must have both Install and Build commands. If you only run Install, `dist/` is never created and the app will crash on start.

4. **Environment variables** (Add all):

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | (Internal Database URL from 2.1) |
   | `NODE_ENV` | `production` |
   | `JWT_SECRET` | Long random string (e.g. from https://generate-secret.vercel.app/32) |
   | `FRONTEND_URL` | `https://YOUR_STOREFRONT.vercel.app,https://YOUR_ADMIN.vercel.app` (no spaces; use your real Vercel URLs after you create them) |
   | `PAYSTACK_SECRET_KEY` | Your Paystack secret key (`sk_test_...` or `sk_live_...`) |

5. **Create Web Service**. Wait for first deploy.
6. Open **Shell** (or use a one-off job) and run the seed so you have products and admin user:
   ```bash
   cd server && npx prisma db seed
   ```
   If Render doesn’t support shell, run the same command locally with `DATABASE_URL` set to your Render **External** Database URL, then redeploy.
7. Copy the service URL (e.g. `https://aura-fragrance-api.onrender.com`) into the table above as **API URL (Render)**.

### 2.3 (Optional) Keep free tier awake

- Sign up at https://uptimerobot.com (free).
- Add an **HTTP(s) monitor** for `https://YOUR_API_URL/health` every 5 minutes so the free service doesn’t spin down.

---

## Part 3 – Vercel: Storefront (one-time)

1. Go to https://vercel.com → **Add New…** → **Project**.
2. Import the **same** GitHub repo. Branch: `main`.
3. Configure:
   - **Root Directory:** leave default (repository root).
   - **Framework Preset:** Vite.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment variables:**
   - `VITE_API_BASE_URL` = your **API URL (Render)** (e.g. `https://aura-fragrance-api.onrender.com`) – no trailing slash.
   - `VITE_PAYSTACK_PUBLIC_KEY` = your Paystack public key (`pk_test_...` or `pk_live_...`).
5. Deploy. Copy the site URL into the table above as **Storefront URL (Vercel)**.

---

## Part 4 – Vercel: Admin (one-time)

1. **Add New…** → **Project** again.
2. Select the **same** repo. Branch: `main`.
3. Configure:
   - **Root Directory:** `admin` (click Edit and set to `admin`).
   - **Framework Preset:** Vite.
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment variable:**
   - `VITE_API_BASE_URL` = same **API URL (Render)** as the storefront.
5. Deploy. Copy the URL into the table above as **Admin URL (Vercel)**.

---

## Part 5 – Wire CORS (after both Vercel URLs exist)

1. In **Render** → your API service → **Environment**.
2. Set `FRONTEND_URL` to your **storefront** and **admin** origins, comma-separated, no spaces, e.g.:  
   `https://www.experiencebsg.com,https://admin.experiencebsg.com`  
   (If you use Vercel URLs instead of custom domains: `https://YOUR_STOREFRONT.vercel.app,https://YOUR_ADMIN.vercel.app`.)
3. Save. Render will redeploy. The admin at **admin.experiencebsg.com** must be listed here for CORS.

---

## Part 6 – Updating the live site from this folder

From this folder:

```bash
git add .
git commit -m "Your message"
git push origin main
```

- **Vercel** will redeploy the storefront and admin.
- **Render** will redeploy the API.

No need to redeploy manually unless you change env vars.

---

## Migrating database from Render to another provider

If your Render **free** PostgreSQL is expiring, you can move to a free PostgreSQL host (e.g. **Neon**) and only change `DATABASE_URL`. No code changes are required.

### 1. Export data from Render

1. In **Render** → your PostgreSQL service (**website-code-db**) → **Connect** → copy the **External Database URL** (not Internal). It looks like:
   `postgres://user:password@host/database?sslmode=require`
2. On your machine (PowerShell or Git Bash), install [PostgreSQL client tools](https://www.postgresql.org/download/) if needed, then run (replace `YOUR_RENDER_EXTERNAL_URL` with the URL from step 1):
   ```bash
   cd server
   set PGPASSWORD=your_password
   pg_dump "YOUR_RENDER_EXTERNAL_URL" --no-owner --no-acl -F c -f render_backup.dump
   ```
   Or with connection string in one go:
   ```bash
   pg_dump "postgres://user:pass@host/db?sslmode=require" --no-owner --no-acl -F c -f render_backup.dump
   ```
   If `pg_dump` is not in PATH, use the full path (e.g. `"C:\Program Files\PostgreSQL\16\bin\pg_dump.exe"`).

### 2. Create a new database on Neon (free)

1. Sign up at https://neon.tech and create a new project.
2. Create a database if needed (Neon gives you one by default). Copy the **connection string** (Pooled or Direct). It looks like:
   `postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`

### 3. Import data into Neon

From the same folder where you have `render_backup.dump` (or use the full path to the file):

```bash
pg_restore -d "YOUR_NEON_CONNECTION_STRING" --no-owner --no-acl render_backup.dump
```

If you get role errors, you can ignore them as long as tables and data are created. To be safe, create the schema with Prisma first, then restore only data (optional; for a full dump, restore is usually enough).

### 4. Point the API to the new database

- **Render (API service):** Dashboard → your **Web Service** (API) → **Environment** → edit `DATABASE_URL` and set it to your **Neon connection string**. Save. Render will redeploy and use the new DB.
- **Local:** If you use `server/.env` for local dev, set `DATABASE_URL` there to a separate DB (e.g. another Neon DB or the same one) so local work doesn’t affect production.

### 5. Verify and clean up

1. Open your storefront and admin; place a test order or subscribe to the newsletter, then check in the new provider’s UI (or admin panel) that data appears.
2. After you’re satisfied, you can delete the **Render PostgreSQL** service (**website-code-db**) so it’s not billed or suspended.

**Where `DATABASE_URL` is used**

| Place | What to do |
|-------|------------|
| **Render Web Service (API)** | Environment → `DATABASE_URL` = Neon (or other provider) connection string. |
| **Local `server/.env`** | Optional; use a separate DB URL for development. |
| **Code** | No change. Only `server/prisma/schema.prisma` reads `env("DATABASE_URL")`. |

---

## Local development after deployment

- **Database:** Use a separate PostgreSQL (e.g. [Neon](https://neon.tech) free) for local dev so you don’t touch production. Put that URL in `server/.env` as `DATABASE_URL`.
- **Storefront / Admin:** In root `.env` and `admin/.env`, set `VITE_API_BASE_URL=http://localhost:3001` and run the server locally (`cd server && npm run dev`).
