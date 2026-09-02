// Script to programmatically enable Row-Level Security (RLS) on all public tables in Supabase
// Run with: node --env-file=.env scripts/enable-rls.mjs
import pg from 'pg';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("Error: DIRECT_URL or DATABASE_URL environment variables are not defined in your .env file.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString });

async function main() {
  const client = await pool.connect();
  try {
    console.log("Connected to Supabase PostgreSQL database.");

    // Query all user-created tables in the 'public' schema
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name NOT LIKE '_prisma_migrations';
    `);

    const tables = res.rows.map(row => row.table_name);
    console.log(`Found ${tables.length} tables to secure:`, tables);

    for (const table of tables) {
      console.log(`Enabling Row Level Security on table: "${table}"...`);
      await client.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
    }

    console.log("\nSuccess: Row-Level Security (RLS) has been enabled on all public tables!");
    console.log("This blocks unauthorized external API access while allowing our Next.js backend (which connects as the database owner) to continue working perfectly.");

  } catch (err) {
    console.error("Database operation failed:", err.message);
  } finally {
    client.release();
  }
}

main().catch(e => {
  console.error(e);
}).finally(() => {
  pool.end();
});
