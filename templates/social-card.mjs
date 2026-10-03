import { brandGradient, chip, monogram, svgDoc } from '../scripts/lib/svg.mjs';
import { fit, text, wrap } from '../scripts/lib/text.mjs';

const W = 1280;
const H = 640;

/** Open Graph image for a repository (Settings → Social preview). */
export function socialCard(card, cfg, t) {
  const titleSize = fit(card.title, 'display', 84, W - 160);
  const lines = wrap(card.summary, 'sans', 28, W - 160, 2);
  let cx = 80;
  let chips = '';
  for (const s of card.stack) {
    const c = chip(s, cx, 452, t, { size: 20, padX: 18, h: 44 });
    chips += c.svg;
    cx += c.width + 12;
  }
  const defs = `${brandGradient('brand', t)}${brandGradient('ring', t, { x2: 1, y2: 1 })}
<pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" stroke="${t.grid}" stroke-opacity="${t.gridOpacity * 1.5}"/></pattern>
<radialGradient id="fade" cx="0.7" cy="0.3" r="0.8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="gm"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="90"/></filter>`;
  const body = `<rect width="${W}" height="${H}" fill="${t.bg}"/>
<g filter="url(#blur)">
<ellipse cx="1120" cy="60" rx="360" ry="180" fill="${t.accent}" opacity="0.4"/>
<ellipse cx="860" cy="640" rx="320" ry="150" fill="${t.accent3}" opacity="0.32"/>
</g>
<rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gm)"/>
${monogram(80, 72, 64, t, 'ring')}
${text(card.eyebrow.toUpperCase(), { font: 'monoMedium', size: 18, x: 166, y: 112, fill: t.text3, tracking: 2.4 })}
${text(card.title, { font: 'display', size: titleSize, x: 76, y: 270, fill: t.text })}
${lines.map((l, i) => text(l, { font: 'sans', size: 28, x: 80, y: 336 + i * 40, fill: t.text2 })).join('\n')}
${chips}
<rect x="80" y="${H - 64}" width="${W - 160}" height="1" fill="${t.border}"/>
${text(`${cfg.name} · Full Stack Developer`, { font: 'sansBold', size: 20, x: 80, y: H - 28, fill: t.text })}
${text('leandro-cortes.com', { font: 'mono', size: 18, x: W - 80, y: H - 28, fill: 'url(#brand)', anchor: 'end' })}`;
  return svgDoc({ w: W, h: H, title: `${card.title} — ${card.summary}`, defs, body });
}
