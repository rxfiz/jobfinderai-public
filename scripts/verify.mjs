import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const origin = 'https://jobfinderai.app/';
const banned = /(?:founder@jobfinderai\.app|https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?|sourceMappingURL=|\/api\/v\d+\/|\/(?:dashboard|admin|profiles?|documents|applications|login|register|sign-?in|signup|account|settings)(?:[/?#"'\s]|$))/i;
const required = ['index.html', '404.html', 'robots.txt', 'sitemap.xml', '_headers', 'favicon.svg', 'social-preview.png', 'theme-bootstrap.js'];

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (entry.isSymbolicLink()) throw new Error(`Unexpected symbolic link in static output: ${entry.name}`);
    const filename = path.join(directory, entry.name);
    result.push(...(entry.isDirectory() ? await files(filename) : [filename]));
  }
  return result;
}

for (const name of required) await stat(path.join(dist, name));
const listing = await files(dist);
if (listing.length > 1000) throw new Error(`Pages direct upload accepts at most 1,000 files; found ${listing.length}.`);
let totalBytes = 0;
for (const filename of listing) {
  const relative = path.relative(dist, filename).replaceAll(path.sep, '/');
  if (/(?:^|\/)(?:\.git|node_modules|\.vite|backups?|data|functions)(?:\/|$)|\.map$|\.env(?:\.|$)|\.(?:db|sqlite3?|bak|py|pem|key)$/i.test(relative)) throw new Error(`Non-public or development file in static output: ${relative}`);
  const bytes = await readFile(filename);
  totalBytes += bytes.byteLength;
  const ext = path.extname(filename).toLowerCase();
  if (['.html', '.js', '.css', '.txt', '.xml', '.svg', '.json'].includes(ext)) {
    const content = bytes.toString('utf8');
    if (banned.test(content)) throw new Error(`Private route, local origin, founder email, or source map reference in ${relative}`);
  }
}
if (totalBytes > 25 * 1024 * 1024) throw new Error(`Pages direct-upload size limit exceeded: ${totalBytes} bytes.`);
const index = await readFile(path.join(dist, 'index.html'), 'utf8');
for (const token of [origin, 'hello@jobfinderai.app', 'support@jobfinderai.app', 'Find the role.', 'Build the case.', 'theme-bootstrap.js']) {
  if (!index.includes(token)) throw new Error(`Missing expected public content in index.html: ${token}`);
}
if (index.includes('/src/entry.jsx')) throw new Error('Source-only Vite entry remains in the static HTML.');
const builtScripts = [...index.matchAll(/<script\b[^>]*\bsrc="\/([^\"]+)"/g)].map(match => match[1]);
if (!builtScripts.length || builtScripts.some(asset => !listing.some(filename => path.relative(dist, filename).replaceAll(path.sep, '/') === asset))) {
  throw new Error('The static HTML must reference built JavaScript files that exist in the output.');
}
for (const name of ['robots.txt', 'sitemap.xml']) {
  const content = await readFile(path.join(dist, name), 'utf8');
  if (!content.includes('https://jobfinderai.app')) throw new Error(`${name} does not use the production origin.`);
}
if (listing.some(filename => /(?:app\.html|\.vite\/manifest)/.test(path.relative(dist, filename)))) throw new Error('Private shell/build manifest found in public output.');
console.log(`Verified ${listing.length} public files (${totalBytes} bytes); no backend, private shell, local origin, credentials, or source maps.`);
