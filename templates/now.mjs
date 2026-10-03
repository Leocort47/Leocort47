import { brandGradient, cardFrame, eyebrow, svgDoc } from '../scripts/lib/svg.mjs';
import { text, wrap } from '../scripts/lib/text.mjs';

const W = 600;
const H = 350;

export function now(cfg, t) {
  const frame = cardFrame({ w: W, h: H, t, glow: 'tl', id: 'now' });
  let rows = '';
  cfg.now.items.forEach((item, i) => {
    const y = 104 + i * 62;
    const detail = wrap(item.detail, 'sans', 15.5, W - 96, 1)[0];
    rows += `<rect x="36" y="${y - 13}" width="10" height="10" rx="3" fill="url(#mark)"/>
${text(item.title, { font: 'sansBold', size: 19, x: 62, y, fill: t.text })}
${text(detail, { font: 'sans', size: 15.5, x: 62, y: y + 24, fill: t.text2 })}`;
    if (i < cfg.now.items.length - 1) rows += `<path d="M62 ${y + 41}H${W - 36}" stroke="${t.border}"/>`;
  });
  const body = `${frame.body}
${eyebrow(cfg.now.title, 36, 52, t)}
${rows}`;
  return svgDoc({
    w: W,
    h: H,
    title: `Now: ${cfg.now.items.map((i) => `${i.title} — ${i.detail}`).join('; ')}`,
    defs: `${frame.defs}${brandGradient('mark', t, { x2: 1, y2: 1 })}`,
    body,
  });
}
