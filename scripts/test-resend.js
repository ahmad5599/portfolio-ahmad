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

function requireResend() {
  try {
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    const { Resend } = require('resend');
    return Resend;
  } catch (error) {
    console.error('❌ resend package not found. Install with: npm install resend');
    process.exit(1);
  }
}

async function main() {
  loadEnv('.env.local');
  loadEnv('.env');

  const Resend = requireResend();
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL_RECIPIENT,
      subject: 'Test Email - Portfolio Setup',
      html: '<p>✅ Resend is working correctly!</p>',
    });
    console.log('✅ Resend email sent successfully:', data);
  } catch (error) {
    console.error('❌ Resend email failed:', error.message || error);
    process.exit(1);
  }
}

main();
