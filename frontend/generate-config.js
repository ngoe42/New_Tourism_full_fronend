/**
 * generate-config.js
 *
 * Runs BEFORE `serve` to inject runtime environment variables into
 * dist/config.js so the SPA can read them without a rebuild.
 *
 * Usage (package.json → start): node generate-config.js && serve -s dist -l $PORT
 *
 * Supported env vars:
 *   VITE_API_URL  — full backend API base, e.g. https://backend-xxx.up.railway.app/api/v1
 */
import { writeFileSync } from 'fs';

const config = {};

if (process.env.VITE_API_URL) {
  config.API_URL = process.env.VITE_API_URL;
}

const js = `window.APP_CONFIG = ${JSON.stringify(config)};\n`;

writeFileSync('dist/config.js', js, 'utf-8');
console.log('[generate-config] wrote dist/config.js →', js.trim());
