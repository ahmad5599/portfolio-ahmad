const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function loadEnv(fileName) {
  const envPath = path.resolve(__dirname, '..', fileName);
  if (!fs.existsSync(envPath)) {
    console.warn(`⚠️  Env file not found: ${envPath}`);
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

async function main() {
  loadEnv('.env.local');
  loadEnv('.env');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set. Add it to .env.local');
    process.exit(1);
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const { rows } = await client.query('select current_database() as db, current_user as user, now() as now');
    console.log('✅ Neon connection successful:', rows[0]);
  } catch (error) {
    console.error('❌ Neon connection failed:', error.message || error);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();
