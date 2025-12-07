const fs = require('fs');
const path = require('path');

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

function requireCloudinary() {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    return require('cloudinary').v2;
  } catch (error) {
    console.error('❌ cloudinary package not found. Install with: npm install cloudinary');
    process.exit(1);
  }
}

function main() {
  loadEnv('.env.local');
  loadEnv('.env');

  const cloudinary = requireCloudinary();

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  cloudinary.api.ping((error, result) => {
    if (error) {
      console.error('❌ Cloudinary connection failed:', error.message || error);
      process.exit(1);
    }
    console.log('✅ Cloudinary connection successful!', result);
  });
}

main();
