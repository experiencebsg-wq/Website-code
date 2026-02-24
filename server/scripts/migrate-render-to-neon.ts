/**
 * Migrate data from Render PostgreSQL to Neon.
 * Run from server folder with env vars set (do NOT commit these URLs).
 *
 * 1. Create empty schema on Neon first:
 *    set DATABASE_URL=postgresql://...neon...
 *    npx prisma db push
 *
 * 2. Run this script:
 *    set RENDER_DATABASE_URL=postgresql://...render...
 *    set NEON_DATABASE_URL=postgresql://...neon...
 *    npx tsx scripts/migrate-render-to-neon.ts
 */

import pg from 'pg';
const { Client } = pg;

const TABLE_ORDER = [
  'Product',
  'AdminUser',
  'Order',
  'OrderItem',
  'ContactMessage',
  'NewsletterSubscriber',
] as const;

async function main() {
  const renderUrl = process.env.RENDER_DATABASE_URL;
  const neonUrl = process.env.NEON_DATABASE_URL;
  if (!renderUrl || !neonUrl) {
    console.error('Set RENDER_DATABASE_URL and NEON_DATABASE_URL');
    process.exit(1);
  }

  const render = new Client({ connectionString: renderUrl });
  const neon = new Client({ connectionString: neonUrl });

  try {
    await render.connect();
    await neon.connect();

    for (const table of TABLE_ORDER) {
      const quoted = `"${table}"`;
      const res = await render.query(`SELECT * FROM ${quoted}`);
      const rows = res.rows as Record<string, unknown>[];
      if (rows.length === 0) {
        console.log(`${table}: 0 rows (skip)`);
        continue;
      }
      const cols = Object.keys(rows[0]!);
      const colList = cols.map((c) => `"${c}"`).join(', ');
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
      const insertSql = `INSERT INTO ${quoted} (${colList}) VALUES (${placeholders}) ON CONFLICT ("id") DO NOTHING`;
      for (const row of rows) {
        const values = cols.map((c) => row[c]);
        await neon.query(insertSql, values);
      }
      console.log(`${table}: ${rows.length} rows copied`);
    }

    console.log('Done. Verify in Neon SQL Editor, then set DATABASE_URL on Render to Neon URL.');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await render.end();
    await neon.end();
  }
}

main();
