import { cardFrame, eyebrow, svgDoc } from '../scripts/lib/svg.mjs';
import { text } from '../scripts/lib/text.mjs';

const W = 600;
const H = 300;

export function languages(cfg, data, t) {
  const frame = cardFrame({ w: W, h: H, t, glow: 'tl', id: 'langs' });
  const langs = data.languages;
  const barW = W - 72;
  let x = 36;
  let bar = '';
  langs.forEach((l) => {
    const w = Math.max(2, l.share * barW);
    bar += `<rect x="${x}" y="92" width="${w}" height="12" fill="${l.color}"/>`;
    x += w;
  });
  let list = '';
  const rows = Math.ceil(langs.length / 2);
  const startY = 158 + (4 - rows) * 22;
  langs.forEach((l, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const lx = 36 + col * 276;
    const ly = startY + row * 44;
    const pct = `${(l.share * 100).toFixed(1)}%`;
    list += `<circle cx="${lx + 6}" cy="${ly - 5.5}" r="6" fill="${l.color}"/>
${text(l.name, { font: 'sansMedium', size: 17, x: lx + 22, y: ly, fill: t.text })}
${text(pct, { font: 'mono', size: 14, x: lx + 240, y: ly, fill: t.text3, anchor: 'end' })}`;
  });
  const body = `${frame.body}
${eyebrow('Languages', 36, 52, t)}
${text(`repos active in the last ${cfg.metrics.activeMonths} months`, { font: 'sans', size: 15, x: W - 36, y: 52, fill: t.text3, anchor: 'end' })}
<rect x="36" y="92" width="${barW}" height="12" rx="6" fill="${t.surface2}"/>
<g clip-path="url(#barClip)">${bar}</g>
${list}`;
  return svgDoc({
    w: W,
    h: H,
    title: `Languages in repositories active in the last ${cfg.metrics.activeMonths} months: ${langs.map((l) => `${l.name} ${(l.share * 100).toFixed(1)}%`).join(', ')}`,
    defs: `${frame.defs}<clipPath id="barClip"><rect x="36" y="92" width="${barW}" height="12" rx="6"/></clipPath>`,
    body,
  });
}
