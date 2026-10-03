import { brandGradient, cardFrame, eyebrow, svgDoc } from '../scripts/lib/svg.mjs';
import { measure, text } from '../scripts/lib/text.mjs';

const W = 1200;
const H = 300;
const CELL = 15;
const GAP = 4;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function level(count, max) {
  if (!count) return 0;
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)));
}

export function activity(cfg, data, t) {
  const frame = cardFrame({ w: W, h: H, t, glow: 'br', id: 'act' });
  const weeks = data.weeks;
  const max = Math.max(1, ...weeks.flat().map((d) => d.count));
  const gridW = weeks.length * (CELL + GAP) - GAP;
  const x0 = Math.round((W - gridW) / 2) + 18;
  const y0 = 112;

  let cells = '';
  let months = '';
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    const x = x0 + wi * (CELL + GAP);
    let col = '';
    week.forEach((d) => {
      const day = new Date(`${d.date}T00:00:00Z`).getUTCDay();
      col += `<rect x="${x}" y="${y0 + day * (CELL + GAP)}" width="${CELL}" height="${CELL}" rx="3.5" fill="${t.heat[level(d.count, max)]}"/>`;
    });
    cells += col;
    const m = new Date(`${week[0].date}T00:00:00Z`).getUTCMonth();
    const roomForLabel = wi === 0 ? new Date(`${weeks[2]?.[0]?.date}T00:00:00Z`).getUTCMonth() === m : true;
    if (m !== lastMonth && roomForLabel && wi < weeks.length - 2) {
      months += text(MONTHS[m], { font: 'mono', size: 12, x, y: y0 - 12, fill: t.text3 });
      lastMonth = m;
    }
  });
  const days = [
    ['Mon', 1],
    ['Wed', 3],
    ['Fri', 5],
  ]
    .map(([d, i]) => text(d, { font: 'mono', size: 12, x: x0 - 12, y: y0 + i * (CELL + GAP) + 11, fill: t.text3, anchor: 'end' }))
    .join('');

  const total = data.contributions.toLocaleString('en-US');
  const legendX = W - 36 - 5 * (12 + 4) - measure('More', 'mono', 12) - 8;
  let legend = text('Less', { font: 'mono', size: 12, x: legendX - 8, y: H - 30, fill: t.text3, anchor: 'end' });
  t.heat.forEach((c, i) => {
    legend += `<rect x="${legendX + i * 16}" y="${H - 40}" width="12" height="12" rx="3" fill="${c}"/>`;
  });
  legend += text('More', { font: 'mono', size: 12, x: legendX + 5 * 16 + 4, y: H - 30, fill: t.text3 });

  const body = `${frame.body}
${eyebrow('Contributions', 36, 52, t)}
${text(total, { font: 'displayBold', size: 26, x: W - 36 - measure(' contributions in the last year', 'sans', 16), y: 54, fill: 'url(#num)', anchor: 'end' })}
${text(' contributions in the last year', { font: 'sans', size: 16, x: W - 36, y: 53, fill: t.text2, anchor: 'end' })}
${months}
${days}
${cells}
${legend}`;
  return svgDoc({
    w: W,
    h: H,
    title: `${total} contributions in the last year`,
    defs: `${frame.defs}${brandGradient('num', t)}`,
    body,
  });
}
