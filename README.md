# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Project structure (three separate apps)

| Folder    | App        | Purpose                    |
|-----------|------------|----------------------------|
| **Root**  | Storefront | Customer e-commerce site   |
| **server/** | API      | Backend (Node + Express + Prisma) |
| **admin/**  | Admin     | Admin panel (separate React app)  |

Run each in its own terminal.

### 1. Server (API)

```sh
cd server
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

- API: **http://localhost:3001**
- Seed creates admin user: **admin@bsgfragrance.com** / **admin123**
- See `server/README.md` for env and API details.

### 2. Storefront (customer site)

In the **project root** (not inside `server` or `admin`):

```sh
npm install
```

Create `.env` in the **project root** with:
```env
VITE_API_BASE_URL=http://localhost:3001
```

Then:
```sh
npm run dev
```

- Store: **http://localhost:8080**
- **Admin updates show on the storefront only when `VITE_API_BASE_URL` is set.** The store then loads products from the API (no mock fallback). If the API is down, the store shows an error instead of mock data.

### 3. Admin panel

```sh
cd admin
npm install
```

Create `admin/.env` with:
```env
VITE_API_BASE_URL=http://localhost:3001
```

Then:
```sh
npm run dev
```

- Admin: **http://localhost:5174**
- Login: **admin@bsgfragrance.com** / **admin123** (after running server seed)
- See `admin/README.md` for details.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
