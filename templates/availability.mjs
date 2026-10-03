import { REDUCED_MOTION, arrowNE, brandGradient, cardFrame, chip, svgDoc } from '../scripts/lib/svg.mjs';
import { fit, text } from '../scripts/lib/text.mjs';

const W = 600;
const H = 350;

export function availability(cfg, t) {
  const a = cfg.availability;
  const frame = cardFrame({ w: W, h: H, t, glow: 'br', id: 'avail' });
  const headSize = fit(a.headline, 'display', 46, W - 72);
  let cx = 36;
  let chips = '';
  for (const c of a.chips) {
    const ch = chip(c, cx, 196, t, { size: 13.5 });
    chips += ch.svg;
    cx += ch.width + 8;
  }
  const style = `.pulse{transform-origin:center;transform-box:fill-box;animation:pulse 2.4s ease-out infinite}
@keyframes pulse{0%{opacity:.6;transform:scale(1)}100%{opacity:0;transform:scale(2.8)}}
${REDUCED_MOTION}`;
  const body = `${frame.body}
<circle class="pulse" cx="40" cy="47.5" r="4" fill="${t.success}"/>
<circle cx="40" cy="47.5" r="4" fill="${t.success}"/>
${text(a.title.toUpperCase(), { font: 'monoMedium', size: 13, x: 52, y: 52, fill: t.success, tracking: 1.8 })}
${text(a.headline, { font: 'display', size: headSize, x: 34, y: 128, fill: t.text })}
${text(a.subline, { font: 'sansMedium', size: 20, x: 36, y: 166, fill: 'url(#brand)' })}
${chips}
<path d="M36 262H${W - 36}" stroke="${t.border}"/>
${text('PORTFOLIO & CONTACT', { font: 'monoMedium', size: 12, x: 36, y: 294, fill: t.text3, tracking: 1.6 })}
${text(a.cta, { font: 'sansBold', size: 22, x: 36, y: 324, fill: t.text })}
<rect x="${W - 84}" y="278" width="48" height="48" rx="24" fill="url(#brand)"/>
${arrowNE(W - 67, 295, 14, '#030508', 2.4)}`;
  return svgDoc({
    w: W,
    h: H,
    title: `${a.title}: ${a.headline} — ${a.subline}. ${a.chips.join(', ')}. ${a.cta}`,
    defs: `${frame.defs}${brandGradient('brand', t)}`,
    style,
    body,
  });
}
