import { brandGradient, svgDoc } from '../scripts/lib/svg.mjs';
import { measure, text } from '../scripts/lib/text.mjs';

const H = 52;

const ICONS = {
  portfolio: (c) =>
    `<circle cx="10" cy="10" r="8.5" stroke="${c}" stroke-width="1.8"/><path d="M1.5 10H18.5M10 1.5C12.5 4 13.6 7 13.6 10S12.5 16 10 18.5C7.5 16 6.4 13 6.4 10S7.5 4 10 1.5Z" stroke="${c}" stroke-width="1.6"/>`,
  linkedin: (c) =>
    `<rect width="20" height="20" rx="4" fill="${c}"/><path d="M5.2 8.2H7.6V15H5.2ZM6.4 4.6A1.3 1.3 0 1 1 6.4 7.2 1.3 1.3 0 0 1 6.4 4.6ZM9.2 8.2H11.5V9.2C11.9 8.5 12.7 8 13.8 8 15.9 8 16.3 9.4 16.3 11.2V15H13.9V11.7C13.9 10.9 13.9 9.9 12.8 9.9S11.6 10.8 11.6 11.6V15H9.2Z" fill="#fff"/>`,
  email: (c) =>
    `<rect x="1" y="3.5" width="18" height="13" rx="2.5" stroke="${c}" stroke-width="1.8"/><path d="M2 5L10 11L18 5" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`,
};

export function button({ kind, label, primary }, t) {
  const size = 17;
  const w = Math.round(measure(label, 'sansBold', size) + 92);
  const fg = primary ? '#030508' : t.text;
  const iconColor = primary ? '#030508' : kind === 'linkedin' ? '#0a66c2' : t.text;
  const bg = primary
    ? `<rect width="${w}" height="${H}" rx="26" fill="url(#brand)"/>`
    : `<rect x="0.75" y="0.75" width="${w - 1.5}" height="${H - 1.5}" rx="25.25" fill="${t.surface}" stroke="${t.borderStrong}" stroke-width="1.5"/>`;
  const body = `${bg}
<g transform="translate(26 16)">${ICONS[kind](iconColor)}</g>
${text(label, { font: 'sansBold', size, x: 58, y: 32, fill: fg })}`;
  return svgDoc({ w, h: H, title: label, defs: brandGradient('brand', t), body });
}
