# BSG Admin Panel

Standalone admin app for BSG Fragrance. Run it separately from the storefront and API.

## Setup

1. **Install dependencies**
   ```bash
   cd admin
   npm install
   ```

2. **Environment**
   Create `admin/.env` (or copy from `admin/.env.example`):
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```
   The API (server) must be running for the admin to work.

## Run

```bash
cd admin
npm run dev
```

Admin runs at **http://localhost:5174** by default.

## Login

- **URL:** http://localhost:5174 (or http://localhost:5174/login)
- **Credentials:** Create an admin user by running the server seed: `cd server && npm run db:seed`
  - Default: **admin@bsgfragrance.com** / **admin123**

## Routes

- `/login` – Admin login
- `/` – Dashboard
- `/products` – Products (CRUD)
- `/orders` – Orders list
- `/orders/:id` – Order detail
- `/contacts` – Contact messages
