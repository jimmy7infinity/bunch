import { copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const publicDir = join(__dirname, '..', 'public');
const distDir = join(__dirname, '..', 'dist');

// Copy extension files to dist
copyFileSync(join(publicDir, 'manifest.json'), join(distDir, 'manifest.json'));
copyFileSync(join(publicDir, 'service-worker.js'), join(distDir, 'service-worker.js'));

console.log('✅ Extension files copied to dist/');



