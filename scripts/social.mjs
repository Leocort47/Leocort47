import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { themes } from './lib/theme.mjs';
import { socialCard } from '../templates/social-card.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets/social');
const cfg = JSON.parse(readFileSync(join(root, 'profile.config.json'), 'utf8'));

mkdirSync(out, { recursive: true });
for (const card of cfg.social) {
  const svg = socialCard(card, cfg, themes.dark);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(join(out, `${card.repo}.png`));
  console.log(`assets/social/${card.repo}.png`);
}
