import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { fonts as fontFiles } from './theme.mjs';

const fontDir = join(dirname(fileURLToPath(import.meta.url)), '../../fonts');
const loaded = {};

function font(key) {
  if (!loaded[key]) {
    const buf = readFileSync(join(fontDir, fontFiles[key]));
    loaded[key] = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
  }
  return loaded[key];
}

// Characters missing in the display fonts (arrows, symbols) fall back to these.
const FALLBACK = ['sans', 'mono'];

function layout(str, key, size, tracking) {
  const items = [];
  let x = 0;
  let prev = null;
  let prevFont = null;
  for (const ch of str) {
    let f = font(key);
    let g = f.charToGlyph(ch);
    if (!g || g.index === 0) {
      for (const alt of FALLBACK) {
        const af = font(alt);
        const ag = af.charToGlyph(ch);
        if (ag && ag.index !== 0) {
          f = af;
          g = ag;
          break;
        }
      }
    }
    const scale = size / f.unitsPerEm;
    if (prev && prevFont === f) x += f.getKerningValue(prev, g) * scale;
    items.push({ g, x });
    x += g.advanceWidth * scale + tracking;
    prev = g;
    prevFont = f;
  }
  return { items, width: Math.max(0, x - (items.length ? tracking : 0)) };
}

export function measure(str, key = 'sans', size = 16, tracking = 0) {
  return layout(String(str), key, size, tracking).width;
}

// Glyph outlines defined once per document and placed with <use>, which keeps the files small.
const GLYPH_SIZE = 100;
const glyphs = new Map();

function glyphId(g) {
  let entry = glyphs.get(g);
  if (!entry) {
    entry = { id: `g${glyphs.size.toString(36)}`, d: g.getPath(0, 0, GLYPH_SIZE).toPathData(1) };
    glyphs.set(g, entry);
  }
  return entry;
}

/** Returns the <defs> content for glyphs used since the last call, then resets the registry. */
export function takeGlyphDefs() {
  let defs = '';
  for (const { id, d } of glyphs.values()) if (d) defs += `<path id="${id}" d="${d}"/>`;
  glyphs.clear();
  return defs;
}

/** Renders text as vector outlines, so GitHub shows the exact brand typography. */
export function text(str, opts = {}) {
  const { fill = '#000' } = opts;
  if (String(fill).startsWith('url(')) return textPath(str, opts);
  const { font: key = 'sans', size = 16, x = 0, y = 0, anchor = 'start', tracking = 0, opacity, cls } = opts;
  const { items, width } = layout(String(str), key, size, tracking);
  const ox = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  const s = +(size / GLYPH_SIZE).toFixed(4);
  let uses = '';
  for (const it of items) {
    const entry = glyphId(it.g);
    if (!entry.d) continue;
    uses += `<use href="#${entry.id}" transform="translate(${+(ox + it.x).toFixed(1)} ${+y.toFixed(1)}) scale(${s})"/>`;
  }
  if (!uses) return '';
  const extra = `${opacity != null ? ` opacity="${opacity}"` : ''}${cls ? ` class="${cls}"` : ''}`;
  return `<g fill="${fill}"${extra}>${uses}</g>`;
}

/** Single-path variant, needed when the fill is a gradient spanning the whole word. */
function textPath(str, opts = {}) {
  const {
    font: key = 'sans',
    size = 16,
    x = 0,
    y = 0,
    fill = '#000',
    anchor = 'start',
    tracking = 0,
    opacity,
    cls,
  } = opts;
  const { items, width } = layout(String(str), key, size, tracking);
  const ox = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  let d = '';
  for (const it of items) d += it.g.getPath(ox + it.x, y, size).toPathData(1);
  if (!d) return '';
  const extra = `${opacity != null ? ` opacity="${opacity}"` : ''}${cls ? ` class="${cls}"` : ''}`;
  return `<path d="${d}" fill="${fill}"${extra}/>`;
}

/** Greedy word wrap using real glyph widths. */
export function wrap(str, key, size, maxWidth, maxLines = Infinity) {
  const words = String(str).split(/\s+/);
  const lines = [];
  let line = '';
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (measure(next, key, size) > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/[\s,.;:]+\S*$/, '')}…`;
    return kept;
  }
  return lines;
}

/** Largest font size (<= max) at which the text fits in maxWidth. */
export function fit(str, key, max, maxWidth, tracking = 0) {
  let size = max;
  while (size > 8 && measure(str, key, size, tracking) > maxWidth) size -= 1;
  return size;
}
