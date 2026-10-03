import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'fonts');
mkdirSync(out, { recursive: true });

const files = [
  ['syne', 'syne-latin-700-normal.woff'],
  ['syne', 'syne-latin-800-normal.woff'],
  ['space-grotesk', 'space-grotesk-latin-400-normal.woff'],
  ['space-grotesk', 'space-grotesk-latin-500-normal.woff'],
  ['space-grotesk', 'space-grotesk-latin-600-normal.woff'],
  ['jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'],
  ['jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'],
];

for (const [pkg, file] of files) {
  copyFileSync(join(root, 'node_modules/@fontsource', pkg, 'files', file), join(out, file));
}
for (const pkg of new Set(files.map(([p]) => p))) {
  copyFileSync(join(root, 'node_modules/@fontsource', pkg, 'LICENSE'), join(out, `${pkg}-OFL.txt`));
}
console.log(`Copied ${files.length} fonts to fonts/`);
