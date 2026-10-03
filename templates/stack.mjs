import * as icons from 'simple-icons';
import { cardFrame, contrast, eyebrow, svgDoc } from '../scripts/lib/svg.mjs';
import { fit, text } from '../scripts/lib/text.mjs';

const W = 1200;
const H = 350;

function iconTile(item, x, y, t) {
  const tile = `<rect x="${x}" y="${y}" width="38" height="38" rx="10" fill="${t.surface2}" stroke="${t.border}"/>`;
  const si = item.icon && icons[`si${item.icon}`];
  let color = si ? `#${si.hex}` : item.color || t.accent;
  if (contrast(color, t.surface2) < 2.2) color = t.text;
  if (si) {
    return `${tile}<g transform="translate(${x + 9} ${y + 9}) scale(${20 / 24})"><path d="${si.path}" fill="${color}"/></g>`;
  }
  const size = fit(item.mono, 'display', 15, 26);
  return `${tile}${text(item.mono, { font: 'display', size, x: x + 19, y: y + 19 + size * 0.36, fill: color, anchor: 'middle' })}`;
}

export function stack(cfg, t) {
  const frame = cardFrame({ w: W, h: H, t, glow: 'tl', id: 'stack' });
  const colW = (W - 72) / cfg.stack.length;
  let cols = '';
  cfg.stack.forEach((group, gi) => {
    const x = 36 + gi * colW;
    if (gi > 0) cols += `<path d="M${x - 14} 92V${H - 32}" stroke="${t.border}"/>`;
    cols += text(group.group, { font: 'sansBold', size: 17, x, y: 104, fill: t.text });
    group.items.forEach((item, i) => {
      const y = 122 + i * 44;
      cols += iconTile(item, x, y, t);
      cols += text(item.name, { font: 'sans', size: 16, x: x + 52, y: y + 25, fill: t.text2 });
    });
  });
  const all = cfg.stack.map((g) => `${g.group}: ${g.items.map((i) => i.name).join(', ')}`).join('. ');
  const body = `${frame.body}
${eyebrow('Tech stack', 36, 52, t)}
${text('Tools I ship to production', { font: 'sans', size: 15, x: W - 36, y: 52, fill: t.text3, anchor: 'end' })}
${cols}`;
  return svgDoc({ w: W, h: H, title: `Tech stack. ${all}.`, defs: frame.defs, body });
}
