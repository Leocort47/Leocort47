import { measure, takeGlyphDefs, text } from './text.mjs';

export const REDUCED_MOTION = '@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}';

export function svgDoc({ w, h, title, defs = '', style = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" role="img" aria-label="${escapeAttr(title)}">
<title>${escapeXml(title)}</title>
<defs>${defs}${takeGlyphDefs()}</defs>
${style ? `<style>${style}</style>` : ''}
${body}
</svg>
`;
}

export function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function escapeAttr(s) {
  return escapeXml(s).replace(/"/g, '&quot;');
}

export function brandGradient(id, t, { x1 = 0, y1 = 0, x2 = 1, y2 = 0 } = {}) {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
<stop offset="0" stop-color="${t.accent}"/><stop offset="0.55" stop-color="${t.accent2}"/><stop offset="1" stop-color="${t.accent3}"/></linearGradient>`;
}

/** Card background: surface, hairline border and a soft brand glow in one corner. */
export function cardFrame({ w, h, t, glow = 'tl', id = 'card' }) {
  const cx = glow.includes('r') ? w : 0;
  const cy = glow.includes('b') ? h : 0;
  const defs = `<radialGradient id="${id}-glow" cx="${cx}" cy="${cy}" r="${Math.max(w, h) * 0.75}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="${t.accent}" stop-opacity="${t.glowOpacity}"/>
<stop offset="0.45" stop-color="${t.accent3}" stop-opacity="${t.glowOpacity * 0.35}"/>
<stop offset="1" stop-color="${t.accent3}" stop-opacity="0"/></radialGradient>
<clipPath id="${id}-clip"><rect width="${w}" height="${h}" rx="22"/></clipPath>`;
  const body = `<g clip-path="url(#${id}-clip)"><rect width="${w}" height="${h}" fill="${t.surface}"/><rect width="${w}" height="${h}" fill="url(#${id}-glow)"/></g>
<rect x="0.75" y="0.75" width="${w - 1.5}" height="${h - 1.5}" rx="21.25" stroke="${t.border}" stroke-width="1.5"/>`;
  return { defs, body };
}

/** Mono uppercase eyebrow label with a brand dot. */
export function eyebrow(label, x, y, t, color) {
  return `<circle cx="${x + 4}" cy="${y - 4.5}" r="4" fill="${color || t.accent2}"/>
${text(label.toUpperCase(), { font: 'monoMedium', size: 13, x: x + 16, y, fill: t.text3, tracking: 1.8 })}`;
}

/** Pill with mono text; returns { svg, width }. */
export function chip(label, x, y, t, { size = 14, padX = 12, h = 30, font = 'mono' } = {}) {
  const w = Math.round(measure(label, font, size) + padX * 2);
  const svg = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${t.surface2}" stroke="${t.border}"/>
${text(label, { font, size, x: x + padX, y: y + h / 2 + size * 0.36, fill: t.text2 })}`;
  return { svg, width: w };
}

/** North-east arrow drawn as a path (independent of font glyph coverage). */
export function arrowNE(x, y, size, color, strokeWidth = 2) {
  const s = size;
  return `<path d="M${x} ${y + s}L${x + s} ${y}M${x + s * 0.3} ${y}H${x + s}V${y + s * 0.7}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

export function monogram(x, y, size, t, gradId) {
  const r = size * 0.24;
  return `<g transform="translate(${x} ${y})">
<rect width="${size}" height="${size}" rx="${r}" fill="${t.name === 'dark' ? '#030508' : '#0b1220'}"/>
<rect x="1.5" y="1.5" width="${size - 3}" height="${size - 3}" rx="${r - 1.5}" stroke="url(#${gradId})" stroke-width="2"/>
${text('LC', { font: 'display', size: size * 0.42, x: size / 2, y: size * 0.65, fill: '#f4f8ff', anchor: 'middle' })}
</g>`;
}

/** Relative luminance, used to keep dark brand icons visible on dark cards. */
export function luminance(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
