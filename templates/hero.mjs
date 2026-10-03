import { REDUCED_MOTION, brandGradient, monogram, svgDoc } from '../scripts/lib/svg.mjs';
import { fit, measure, text } from '../scripts/lib/text.mjs';

const W = 1200;
const H = 400;

function codeCard(cfg, t) {
  const x = 724;
  const y = 64;
  const w = 412;
  const h = 272;
  const size = 15;
  const lh = 27;
  const charW = measure('M', 'mono', size);
  const c = cfg.hero.code;
  const str = (s) => `'${s}'`;
  const lines = [
    [['const ', t.accent3], ['leandro', t.text], [' = {', t.text3]],
    [['  role', t.text], [': ', t.text3], [str(c.role), t.accent2], [',', t.text3]],
    [['  focus', t.text], [': ', t.text3], [str(c.focus), t.accent2], [',', t.text3]],
    [['  stack', t.text], [': [', t.text3], [c.stack.map(str).join(', '), t.accent2], ['],', t.text3]],
    [['  graduates', t.text], [': ', t.text3], [str(c.graduates), t.accent2], [',', t.text3]],
    [['  english', t.text], [': ', t.text3], [str(c.english), t.accent2], [',', t.text3]],
    [['}', t.text3], [' satisfies ', t.accent3], ['Engineer', t.accent]],
  ];
  let body = '';
  lines.forEach((segs, i) => {
    const ly = y + 82 + i * lh;
    body += text(String(i + 1).padStart(2, ' '), { font: 'mono', size: 13, x: x + 22, y: ly, fill: t.text3, opacity: 0.55 });
    let cx = x + 56;
    for (const [s, color] of segs) {
      body += text(s, { font: 'mono', size, x: cx, y: ly, fill: color });
      cx += s.length * charW;
    }
    if (i === lines.length - 1) body += `<rect class="cursor" x="${cx + 4}" y="${ly - 14}" width="8" height="18" rx="1.5" fill="${t.accent2}"/>`;
  });
  return `<g class="float">
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="${t.surface}" fill-opacity="${t.name === 'dark' ? 0.78 : 0.92}" stroke="${t.borderStrong}"/>
<path d="M${x} ${y + 44}H${x + w}" stroke="${t.border}"/>
<circle cx="${x + 24}" cy="${y + 22}" r="5.5" fill="#ff5f57"/><circle cx="${x + 42}" cy="${y + 22}" r="5.5" fill="#febc2e"/><circle cx="${x + 60}" cy="${y + 22}" r="5.5" fill="#28c840"/>
${text('leandro.ts', { font: 'mono', size: 13, x: x + w / 2, y: y + 27, fill: t.text3, anchor: 'middle' })}
${body}
</g>`;
}

export function hero(cfg, t) {
  const left = 64;
  const maxW = 620;
  const nameSize = fit(cfg.name, 'display', 92, maxW);
  const rotSize = Math.min(...cfg.hero.rotating.map((r) => fit(r, 'sansMedium', 28, maxW)));
  const rotY = 268;

  const rotating = cfg.hero.rotating
    .map((r, i) => `<g class="rot r${i}">${text(r, { font: 'sansMedium', size: rotSize, x: left, y: rotY, fill: 'url(#brand)' })}</g>`)
    .join('\n');

  const statusW = measure(cfg.hero.status, 'sansMedium', 16) + 58;
  const n = cfg.hero.rotating.length;
  const period = n * 4;
  // r0 starts mid-cycle so the first frame (or a paused animation) always shows text.
  const delays = cfg.hero.rotating.map((_, i) => `.r${i}{animation-delay:${i * 4 - 1}s}`).join('');
  const visible = (100 / n).toFixed(2);

  const style = `
.rot{opacity:0;animation:rot ${period}s ease-in-out infinite both;transform-box:fill-box}
.r0{opacity:1}
${delays}
@keyframes rot{0%{opacity:0;transform:translateY(10px)}3%{opacity:1;transform:translateY(0)}${(visible - 3).toFixed(2)}%{opacity:1;transform:translateY(0)}${visible}%{opacity:0;transform:translateY(-10px)}100%{opacity:0}}
.float{animation:float 7s ease-in-out infinite alternate}
@keyframes float{from{transform:translateY(0)}to{transform:translateY(-8px)}}
.cursor{animation:blink 1.1s steps(1) infinite}
@keyframes blink{50%{opacity:0}}
.pulse{transform-origin:center;transform-box:fill-box;animation:pulse 2.4s ease-out infinite}
@keyframes pulse{0%{opacity:.55;transform:scale(1)}100%{opacity:0;transform:scale(2.6)}}
.a1{animation:drift1 18s ease-in-out infinite alternate}
.a2{animation:drift2 22s ease-in-out infinite alternate}
@keyframes drift1{to{transform:translate(-60px,30px)}}
@keyframes drift2{to{transform:translate(70px,-24px)}}
${REDUCED_MOTION}
@media (prefers-reduced-motion: reduce){.r0{opacity:1}}`;

  const defs = `${brandGradient('brand', t)}
${brandGradient('ring', t, { x1: 0, y1: 0, x2: 1, y2: 1 })}
<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" stroke="${t.grid}" stroke-opacity="${t.gridOpacity * 1.6}"/></pattern>
<radialGradient id="fade" cx="0.62" cy="0.4" r="0.75"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="gridMask"><rect width="${W}" height="${H}" fill="url(#fade)"/></mask>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>
<clipPath id="frame"><rect width="${W}" height="${H}" rx="28"/></clipPath>`;

  const body = `<g clip-path="url(#frame)">
<rect width="${W}" height="${H}" fill="${t.bg}"/>
<g filter="url(#blur)">
<ellipse class="a1" cx="1010" cy="70" rx="300" ry="150" fill="${t.accent}" opacity="${t.name === 'dark' ? 0.42 : 0.22}"/>
<ellipse class="a2" cx="760" cy="380" rx="280" ry="130" fill="${t.accent3}" opacity="${t.name === 'dark' ? 0.34 : 0.16}"/>
<ellipse cx="300" cy="-40" rx="260" ry="90" fill="${t.accent2}" opacity="${t.name === 'dark' ? 0.16 : 0.1}"/>
</g>
<rect width="${W}" height="${H}" fill="url(#grid)" mask="url(#gridMask)"/>
</g>
<rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="27.25" stroke="${t.border}" stroke-width="1.5"/>
${monogram(left, 64, 52, t, 'ring')}
${text(cfg.hero.eyebrow.toUpperCase(), { font: 'monoMedium', size: 13, x: left + 70, y: 95, fill: t.text3, tracking: 1.8 })}
${text(cfg.name, { font: 'display', size: nameSize, x: left - 3, y: 212, fill: t.text })}
${rotating}
<g transform="translate(${left} 304)">
<rect width="${statusW}" height="40" rx="20" fill="${t.surface}" fill-opacity="0.85" stroke="${t.borderStrong}"/>
<circle class="pulse" cx="22" cy="20" r="5" fill="${t.success}"/>
<circle cx="22" cy="20" r="5" fill="${t.success}"/>
${text(cfg.hero.status, { font: 'sansMedium', size: 16, x: 38, y: 25.5, fill: t.text2 })}
</g>
${codeCard(cfg, t)}`;

  return svgDoc({ w: W, h: H, title: `${cfg.name} — ${cfg.hero.eyebrow}`, defs, style, body });
}
