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
   - **Build Command:**  
     `npm install && npx prisma generate && npm run build && npx prisma db push`
   - **Start Command:** `npm start`

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
2. Set `FRONTEND_URL` to:  
   `https://YOUR_STOREFRONT.vercel.app,https://YOUR_ADMIN.vercel.app`  
   (exact URLs from the table above, comma-separated, no spaces).
3. Save. Render will redeploy.

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

## Local development after deployment

- **Database:** Use a separate PostgreSQL (e.g. [Neon](https://neon.tech) free) for local dev so you don’t touch production. Put that URL in `server/.env` as `DATABASE_URL`.
- **Storefront / Admin:** In root `.env` and `admin/.env`, set `VITE_API_BASE_URL=http://localhost:3001` and run the server locally (`cd server && npm run dev`).
