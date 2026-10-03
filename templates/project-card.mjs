import { arrowNE, brandGradient, cardFrame, chip, eyebrow, svgDoc } from '../scripts/lib/svg.mjs';
import { fit, measure, text, wrap } from '../scripts/lib/text.mjs';

const W = 600;
const H = 330;

function badge(label, t) {
  const color = label === 'Live' ? t.success : label === 'Code' ? t.accent : t.accent3;
  const size = 12.5;
  const w = measure(label.toUpperCase(), 'monoMedium', size, 1.2) + 40;
  const x = W - 36 - w;
  return `<rect x="${x}" y="28" width="${w}" height="30" rx="15" fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-opacity="0.45"/>
<circle cx="${x + 15}" cy="43" r="3.5" fill="${color}"/>
${text(label.toUpperCase(), { font: 'monoMedium', size, x: x + 25, y: 47.5, fill: color, tracking: 1.2 })}`;
}

export function projectCard(p, t) {
  const frame = cardFrame({ w: W, h: H, t, glow: Number(p.number) % 2 ? 'tl' : 'tr', id: `p${p.number}` });
  const titleSize = fit(p.title, 'displayBold', 36, W - 72);
  const lines = wrap(p.summary, 'sans', 17, W - 72, 3);
  const summary = lines.map((l, i) => text(l, { font: 'sans', size: 17, x: 36, y: 154 + i * 25, fill: t.text2 })).join('\n');
  let cx = 36;
  let chips = '';
  for (const s of p.stack) {
    const c = chip(s, cx, 258, t, { size: 13 });
    chips += c.svg;
    cx += c.width + 8;
  }
  const body = `${frame.body}
${eyebrow(`${p.number} · ${p.category}`, 36, 48, t)}
${badge(p.badge, t)}
${text(p.title, { font: 'displayBold', size: titleSize, x: 35, y: 114, fill: t.text })}
${summary}
${chips}
<circle cx="${W - 56}" cy="273" r="20" stroke="${t.borderStrong}"/>
${arrowNE(W - 62, 267, 12, t.text2)}
<rect x="36" y="${H - 2}" width="96" height="2" rx="1" fill="url(#line)"/>`;
  return svgDoc({
    w: W,
    h: H,
    title: `${p.title} (${p.category}, ${p.badge}): ${p.summary} Stack: ${p.stack.join(', ')}.`,
    defs: `${frame.defs}${brandGradient('line', t)}`,
    body,
  });
}
