import bcrypt from 'bcryptjs';
import { pathToFileURL } from 'node:url';
import { prisma } from './prisma.js';

/**
 * Sync the admin account to the credentials held in the environment.
 *
 * Env vars (set these in the host, e.g. Render):
 *   SEED_ADMIN_EMAIL     optional, defaults to the canonical admin address
 *   SEED_ADMIN_PASSWORD  required to do anything (min 10 chars)
 *
 * Runs on every server boot, so to set/rotate the admin password you just
 * change SEED_ADMIN_PASSWORD in the host env and redeploy. When the password
 * env var is absent the step is skipped (server still starts normally).
 */
export async function ensureAdminUser(): Promise<void> {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@bsgfragrance.com').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (!password) {
    console.warn('[ensureAdmin] SEED_ADMIN_PASSWORD not set — skipping admin sync.');
    return;
  }
  if (password.length < 10) {
    console.warn('[ensureAdmin] SEED_ADMIN_PASSWORD must be at least 10 characters — skipping admin sync.');
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash },
    update: { passwordHash },
  });
  console.log(`[ensureAdmin] Admin account synced from env: ${email}`);
}

// Allow running directly (e.g. `npm run admin:set` in the Render Shell).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  ensureAdminUser()
    .then(() => prisma.$disconnect())
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('[ensureAdmin] failed:', e);
      process.exit(1);
    });
}
