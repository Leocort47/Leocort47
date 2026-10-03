import { brandGradient, cardFrame, eyebrow, svgDoc } from '../scripts/lib/svg.mjs';
import { text } from '../scripts/lib/text.mjs';

const W = 600;
const H = 300;

export function stats(cfg, data, t) {
  const frame = cardFrame({ w: W, h: H, t, glow: 'tr', id: 'stats' });
  const years = new Date().getUTCFullYear() - cfg.since;
  const cells = [
    { value: data.contributions.toLocaleString('en-US'), label: 'Contributions · last 12 months' },
    { value: data.commits.toLocaleString('en-US'), label: 'Commits · last 12 months' },
    { value: String(data.repositories), label: 'Repositories' },
    { value: `${years}+`, label: `Years building · since ${cfg.since}` },
  ];
  let grid = '';
  cells.forEach((c, i) => {
    const x = 36 + (i % 2) * 276;
    const y = 132 + Math.floor(i / 2) * 104;
    grid += text(c.value, { font: 'display', size: 50, x: x - 2, y, fill: 'url(#num)' });
    grid += text(c.label, { font: 'sans', size: 15, x, y: y + 27, fill: t.text2 });
  });
  const body = `${frame.body}
${eyebrow('GitHub activity', 36, 52, t)}
<path d="M300 84V${H - 28}" stroke="${t.border}"/>
<path d="M36 186H${W - 36}" stroke="${t.border}"/>
${grid}`;
  return svgDoc({
    w: W,
    h: H,
    title: `GitHub activity: ${cells.map((c) => `${c.value} ${c.label}`).join('; ')}`,
    defs: `${frame.defs}${brandGradient('num', t, { x2: 1, y2: 1 })}`,
    body,
  });
}
