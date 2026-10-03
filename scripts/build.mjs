import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { themes } from './lib/theme.mjs';
import { loadGitHubData } from './github.mjs';
import { hero } from '../templates/hero.mjs';
import { now } from '../templates/now.mjs';
import { availability } from '../templates/availability.mjs';
import { projectCard } from '../templates/project-card.mjs';
import { stack } from '../templates/stack.mjs';
import { stats } from '../templates/stats.mjs';
import { languages } from '../templates/languages.mjs';
import { activity } from '../templates/activity.mjs';
import { button } from '../templates/buttons.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'assets/generated');
const cfg = JSON.parse(readFileSync(join(root, 'profile.config.json'), 'utf8'));

const data = await loadGitHubData({
  login: cfg.login,
  token: process.env.GH_TOKEN || process.env.GITHUB_TOKEN,
  fullScope: process.env.FULL_SCOPE === 'true',
  rawPath: process.env.RAW_FILE,
  cachePath: join(root, 'data/github.json'),
  metrics: cfg.metrics,
});

const buttons = [
  { file: 'btn-portfolio', kind: 'portfolio', label: 'Portfolio', primary: true },
  { file: 'btn-linkedin', kind: 'linkedin', label: 'LinkedIn' },
  { file: 'btn-email', kind: 'email', label: 'Email' },
];

mkdirSync(out, { recursive: true });
let count = 0;
const write = (name, svg) => {
  writeFileSync(join(out, name), svg);
  count += 1;
};

for (const t of Object.values(themes)) {
  write(`hero-${t.name}.svg`, hero(cfg, t));
  write(`now-${t.name}.svg`, now(cfg, t));
  write(`availability-${t.name}.svg`, availability(cfg, t));
  for (const p of cfg.projects) write(`project-${p.slug}-${t.name}.svg`, projectCard(p, t));
  write(`stack-${t.name}.svg`, stack(cfg, t));
  write(`stats-${t.name}.svg`, stats(cfg, data, t));
  write(`languages-${t.name}.svg`, languages(cfg, data, t));
  write(`activity-${t.name}.svg`, activity(cfg, data, t));
  for (const b of buttons) write(`${b.file}-${t.name}.svg`, button(b, t));
}

console.log(`Generated ${count} SVGs · ${data.contributions} contributions · ${data.languages.length} languages`);
