// THE WORLD TODAY — one-day news front page for Sunday 22 November 2026.
// main.ts: draws the whole front page with code (no external images, no
// network) and writes it as entry.png. Node 22, standard library only.
// The news text is embedded below as data; the program is deterministic:
// the same run always writes the same bytes.
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { deflateSync } from 'node:zlib';

// ---------------------------------------------------------------------------
// 5x7 pixel font. Each glyph is 7 rows; each row is a 5-bit mask, the
// leftmost pixel in the highest bit. Only the characters the page uses.
// ---------------------------------------------------------------------------
const FONT: Record<string, number[]> = {
  'A': [0x0E, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
  'B': [0x1E, 0x11, 0x11, 0x1E, 0x11, 0x11, 0x1E],
  'C': [0x0E, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0E],
  'D': [0x1E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1E],
  'E': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x1F],
  'F': [0x1F, 0x10, 0x10, 0x1E, 0x10, 0x10, 0x10],
  'G': [0x0E, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0F],
  'H': [0x11, 0x11, 0x11, 0x1F, 0x11, 0x11, 0x11],
  'I': [0x0E, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0E],
  'J': [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0C],
  'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1F],
  'M': [0x11, 0x1B, 0x15, 0x15, 0x11, 0x11, 0x11],
  'N': [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  'O': [0x0E, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
  'P': [0x1E, 0x11, 0x11, 0x1E, 0x10, 0x10, 0x10],
  'Q': [0x0E, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0D],
  'R': [0x1E, 0x11, 0x11, 0x1E, 0x14, 0x12, 0x11],
  'S': [0x0F, 0x10, 0x10, 0x0E, 0x01, 0x01, 0x1E],
  'T': [0x1F, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0E],
  'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0A, 0x04],
  'W': [0x11, 0x11, 0x11, 0x15, 0x15, 0x15, 0x0A],
  'X': [0x11, 0x11, 0x0A, 0x04, 0x0A, 0x11, 0x11],
  'Y': [0x11, 0x11, 0x0A, 0x04, 0x04, 0x04, 0x04],
  'Z': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1F],
  '0': [0x0E, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0E],
  '1': [0x04, 0x0C, 0x04, 0x04, 0x04, 0x04, 0x0E],
  '2': [0x0E, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1F],
  '3': [0x1F, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0E],
  '4': [0x02, 0x06, 0x0A, 0x12, 0x1F, 0x02, 0x02],
  '5': [0x1F, 0x10, 0x1E, 0x01, 0x01, 0x11, 0x0E],
  '6': [0x06, 0x08, 0x10, 0x1E, 0x11, 0x11, 0x0E],
  '7': [0x1F, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0E, 0x11, 0x11, 0x0E, 0x11, 0x11, 0x0E],
  '9': [0x0E, 0x11, 0x11, 0x0F, 0x01, 0x02, 0x0C],
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 0x0C, 0x0C],
  ',': [0, 0, 0, 0, 0x0C, 0x04, 0x08],
  "'": [0x04, 0x04, 0x08, 0, 0, 0, 0],
  ':': [0, 0x0C, 0x0C, 0, 0x0C, 0x0C, 0],
  ';': [0, 0x0C, 0x0C, 0, 0x0C, 0x04, 0x08],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0, 0x04],
  '?': [0x0E, 0x11, 0x01, 0x06, 0x04, 0, 0x04],
  '-': [0, 0, 0, 0x0E, 0, 0, 0],
  '(': [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ')': [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  '/': [0x01, 0x02, 0x02, 0x04, 0x08, 0x08, 0x10],
  '&': [0x0C, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0D],
  '%': [0x19, 0x1A, 0x02, 0x04, 0x08, 0x0B, 0x13],
  '+': [0, 0x04, 0x04, 0x0E, 0x04, 0x04, 0],
  '=': [0, 0, 0x1F, 0, 0x1F, 0, 0],
  '"': [0x0A, 0x0A, 0x0A, 0, 0, 0, 0],
  '$': [0x04, 0x0F, 0x14, 0x0E, 0x05, 0x1E, 0x04],
  '#': [0x0A, 0x0A, 0x1F, 0x0A, 0x1F, 0x0A, 0x0A],
  '*': [0, 0x04, 0x15, 0x0E, 0x15, 0x04, 0],
};

// ---------------------------------------------------------------------------
// Raster canvas: a plain RGB buffer with the few shapes the page needs.
// ---------------------------------------------------------------------------
type RGB = [number, number, number];

class Canvas {
  readonly w: number;
  readonly h: number;
  readonly buf: Uint8Array;
  constructor(w: number, h: number, bg: RGB) {
    this.w = w;
    this.h = h;
    this.buf = new Uint8Array(w * h * 3);
    this.fillRect(0, 0, w, h, bg);
  }
  px(x: number, y: number, c: RGB): void {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 3;
    this.buf[i] = c[0]; this.buf[i + 1] = c[1]; this.buf[i + 2] = c[2];
  }
  fillRect(x: number, y: number, w: number, h: number, c: RGB): void {
    for (let j = y; j < y + h; j++) {
      for (let i = x; i < x + w; i++) this.px(i, j, c);
    }
  }
  // Bresenham line, with a square brush of the given width.
  line(x0: number, y0: number, x1: number, y1: number, c: RGB, width = 1): void {
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy, x = x0, y = y0;
    const r = Math.floor(width / 2);
    for (;;) {
      this.fillRect(x - r, y - r, width, width, c);
      if (x === x1 && y === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x += sx; }
      if (e2 <= dx) { err += dx; y += sy; }
    }
  }
  circle(cx: number, cy: number, r: number, c: RGB): void {
    for (let y = -r; y <= r; y++) {
      const half = Math.floor(Math.sqrt(r * r - y * y));
      for (let x = -half; x <= half; x++) this.px(cx + x, cy + y, c);
    }
  }
  ring(cx: number, cy: number, r: number, c: RGB, width = 2): void {
    for (let a = 0; a < 360; a += 1) {
      const rad = (a * Math.PI) / 180;
      for (let w = 0; w < width; w++) {
        this.px(Math.round(cx + (r + w) * Math.cos(rad)), Math.round(cy + (r + w) * Math.sin(rad)), c);
      }
    }
  }
  // Filled polygon by scanline: pts is a flat list [x0,y0,x1,y1,...].
  poly(pts: number[], c: RGB): void {
    let minY = Infinity, maxY = -Infinity;
    for (let i = 1; i < pts.length; i += 2) {
      minY = Math.min(minY, pts[i]); maxY = Math.max(maxY, pts[i]);
    }
    for (let y = Math.ceil(minY); y <= Math.floor(maxY); y++) {
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i += 2) {
        const x0 = pts[i], y0 = pts[i + 1];
        const x1 = pts[(i + 2) % pts.length], y1 = pts[(i + 3) % pts.length];
        if ((y0 <= y && y1 > y) || (y1 <= y && y0 > y)) {
          xs.push(x0 + ((y - y0) / (y1 - y0)) * (x1 - x0));
        }
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        for (let x = Math.ceil(xs[k]); x <= Math.floor(xs[k + 1]); x++) this.px(x, y, c);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Text. One glyph is 5 wide + 1 of spacing; a line is 7 tall + 2 leading.
// ---------------------------------------------------------------------------
function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}
function drawText(cv: Canvas, s: string, x: number, y: number, scale: number, c: RGB): void {
  let cx = x;
  for (const ch of s) {
    const g = FONT[ch] ?? FONT['?'];
    for (let row = 0; row < 7; row++) {
      const bits = g[row];
      for (let col = 0; col < 5; col++) {
        if (bits & (1 << (4 - col))) {
          cv.fillRect(cx + col * scale, y + row * scale, scale, scale, c);
        }
      }
    }
    cx += 6 * scale;
  }
}
// Greedy word wrap into lines no wider than maxW (pixels).
function wrap(s: string, scale: number, maxW: number): string[] {
  const words = s.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    const trial = cur ? cur + ' ' + w : w;
    if (textWidth(trial, scale) <= maxW || !cur) cur = trial;
    else { lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines;
}
function drawBlock(cv: Canvas, s: string, x: number, y: number, scale: number, maxW: number, c: RGB): number {
  const lines = wrap(s, scale, maxW);
  lines.forEach((ln, i) => drawText(cv, ln, x, y + i * 9 * scale, scale, c));
  return y + lines.length * 9 * scale;
}

// ---------------------------------------------------------------------------
// PNG encoder (colour type 2, 8-bit, Up filter, zlib level 9). No timestamps:
// the same pixels always produce the same bytes.
// ---------------------------------------------------------------------------
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t.push(c >>> 0);
  }
  return t;
})();
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function encodePng(cv: Canvas): Buffer {
  const w = cv.w, h = cv.h;
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 2; // Up filter
    for (let x = 0; x < w * 3; x++) {
      const i = y * w * 3 + x;
      const above = y === 0 ? 0 : cv.buf[(y - 1) * w * 3 + x];
      raw[y * (1 + w * 3) + 1 + x] = (cv.buf[i] - above) & 0xff;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// The page. 1024 x 1024, cream paper, black ink, red accents.
// ---------------------------------------------------------------------------
const W = 1024, H = 1024;
const PAPER: RGB = [247, 243, 232];
const INK: RGB = [24, 24, 24];
const RED: RGB = [176, 32, 32];
const NAVY: RGB = [31, 58, 95];
const GREY: RGB = [90, 86, 78];

function rule(cv: Canvas, x: number, y: number, w: number, h: number): void {
  cv.fillRect(x, y, w, h, INK);
}

function masthead(cv: Canvas): void {
  drawText(cv, 'THE WORLD TODAY', 36, 30, 7, INK);
  // Small globe mark at the top right.
  cv.ring(930, 56, 26, NAVY, 3);
  cv.line(930, 30, 930, 82, NAVY, 2);
  cv.line(904, 56, 956, 56, NAVY, 2);
  cv.line(912, 38, 948, 74, NAVY, 2);
  cv.line(948, 38, 912, 74, NAVY, 2);
  drawText(cv, 'SUNDAY 22 NOVEMBER 2026', 36, 92, 4, RED);
  drawText(cv, 'ONE DAY IN THE NEWS', 649, 96, 3, INK);
  rule(cv, 36, 124, 952, 4);
  rule(cv, 36, 132, 952, 1);
}

// Code-drawn illustration for the lead story: a desert road in Sinaloa at
// dusk, a police car on the road, a helicopter overhead.
function leadIllustration(cv: Canvas, x0: number, y0: number, w: number, h: number): void {
  cv.fillRect(x0, y0, w, h, INK);
  const x1 = x0 + 3, y1 = y0 + 3, x2 = x0 + w - 3, y2 = y0 + h - 3;
  // Sky: warm dusk bands.
  const bands: RGB[] = [
    [252, 222, 140], [250, 205, 120], [246, 185, 100],
    [242, 165, 82], [238, 145, 66], [232, 122, 58],
  ];
  const bandH = Math.ceil(179 / bands.length);
  bands.forEach((c, i) => cv.fillRect(x1, y1 + i * bandH, x2 - x1, bandH, c));
  // Sun.
  cv.circle(910, 205, 30, [255, 216, 100]);
  cv.ring(910, 205, 36, [255, 200, 80], 2);
  // Helicopter silhouette.
  cv.circle(692, 198, 13, [40, 40, 40]);
  cv.line(704, 196, 744, 188, [40, 40, 40], 4);
  cv.line(744, 188, 744, 178, [40, 40, 40], 3);
  cv.line(668, 184, 720, 184, [40, 40, 40], 3);
  cv.line(684, 212, 710, 212, [40, 40, 40], 2);
  // Mountains.
  cv.poly([x1, 330, 700, 268, 745, 310, 800, 262, 860, 315, 920, 275, x2, 320, x2, 352, x1, 352], [90, 60, 70]);
  // Sandy ground.
  cv.fillRect(x1, 352, x2 - x1, y2 - 352, [216, 180, 122]);
  // Road running down from the mountains.
  cv.poly([700, y2, 780, 352, 820, 352, 760, y2], [60, 60, 66]);
  for (let i = 0; i < 5; i++) {
    const t0 = 0.08 + i * 0.18, t1 = t0 + 0.09;
    cv.line(
      Math.round(780 + (695 - 780) * t0), Math.round(352 + (y2 - 352) * t0),
      Math.round(780 + (695 - 780) * t1), Math.round(352 + (y2 - 352) * t1),
      [247, 243, 232], 3,
    );
  }
  // Police car on the road.
  cv.fillRect(700, 440, 95, 22, NAVY);
  cv.poly([722, 440, 734, 420, 766, 420, 778, 440], NAVY);
  cv.fillRect(736, 424, 28, 14, [180, 210, 230]);
  cv.circle(720, 466, 9, [20, 20, 20]);
  cv.circle(768, 466, 9, [20, 20, 20]);
  cv.circle(720, 466, 3, [150, 150, 150]);
  cv.circle(768, 466, 3, [150, 150, 150]);
  cv.fillRect(732, 412, 32, 8, [20, 20, 20]);
  cv.circle(740, 416, 5, [200, 30, 30]);
  cv.circle(754, 416, 5, [30, 80, 200]);
  cv.ring(740, 416, 10, [200, 30, 30], 2);
  cv.ring(754, 416, 10, [30, 80, 200], 2);
  // Caption label.
  cv.fillRect(x1 + 5, y1 + 5, 120, 24, INK);
  drawText(cv, 'SINALOA', x1 + 13, y1 + 11, 2, [255, 255, 255]);
}

function leadStory(cv: Canvas): void {
  drawText(cv, 'MEXICO', 36, 148, 3, RED);
  drawText(cv, 'MEXICO CAPTURES', 36, 180, 6, INK);
  drawText(cv, "'EL CHAPO ISIDRO'", 36, 234, 6, INK);
  drawBlock(
    cv,
    "FAUSTO ISIDRO MEZA FLORES, ON THE FBI'S TEN MOST WANTED LIST, IS ARRESTED AFTER A SHOOT-OUT IN SINALOA. IT IS THE LATEST IN A STRING OF CARTEL ARRESTS.",
    36, 296, 3, 584, INK,
  );
  leadIllustration(cv, 640, 148, 348, 352);
  rule(cv, 36, 512, 952, 4);
  rule(cv, 36, 520, 952, 1);
}

function storyColumn(
  cv: Canvas, x: number, y: number, w: number,
  kicker: string, headline: string[], summary: string, summaryScale: number,
): number {
  drawText(cv, kicker, x, y, 3, RED);
  let cy = y + 30;
  for (const ln of headline) {
    drawText(cv, ln, x, cy, 4, INK);
    cy += 36;
  }
  cy += 6;
  return drawBlock(cv, summary, x, cy, summaryScale, w, INK);
}

function middleRow(cv: Canvas): void {
  // Ukraine, left column. Small flag mark at the top right of the column.
  cv.fillRect(452, 536, 40, 26, INK);
  cv.fillRect(453, 537, 38, 11, [0, 91, 187]);
  cv.fillRect(453, 549, 38, 12, [255, 213, 0]);
  storyColumn(cv, 36, 536, 460, 'UKRAINE',
    ['ZELENSKYY: PUTIN IS', "A 'KILLER'"],
    'AFTER TRUMP CALLED PUTIN A FRIEND. KYIV SAYS THE US WANTS THREE-WAY TALKS BEFORE CHRISTMAS.',
    3);
  // Iran / Bahrain, right column. Small radar mark at the top right.
  cv.circle(968, 549, 13, INK);
  cv.circle(968, 549, 9, [247, 243, 232]);
  cv.circle(968, 549, 3, RED);
  cv.line(968, 549, 978, 541, RED, 2);
  storyColumn(cv, 528, 536, 460, 'MIDDLE EAST',
    ['IRAN STRIKES US', 'BASES IN BAHRAIN'],
    'TEHRAN CLAIMS ITS MISSILES HIT TWO US PATRIOT RADARS. BAHRAIN SAYS A CIVILIAN SITE BURNED. NO ONE WAS HURT.',
    3);
  cv.line(512, 536, 512, 772, GREY, 1);
  rule(cv, 36, 784, 952, 4);
  rule(cv, 36, 792, 952, 1);
}

function bottomRow(cv: Canvas): void {
  // COP31, left column. Small globe mark.
  cv.circle(472, 817, 13, [46, 125, 50]);
  cv.ring(472, 817, 13, [46, 125, 50], 2);
  cv.line(472, 804, 472, 830, [255, 255, 255], 2);
  cv.line(459, 817, 485, 817, [255, 255, 255], 2);
  storyColumn(cv, 36, 800, 460, 'CLIMATE',
    ['COP31 NEARS DEAL', 'AFTER DEADLOCK'],
    'AFTER RUNNING PAST ITS FRIDAY DEADLINE, THE ANTALYA SUMMIT PUTS A NEW PACKAGE TO DELEGATES ON SUNDAY.',
    2);
  // ATP Finals, right column. Small tennis-ball mark.
  cv.circle(968, 817, 13, [180, 200, 40]);
  cv.line(958, 808, 968, 817, [255, 255, 255], 2);
  cv.line(968, 817, 978, 826, [255, 255, 255], 2);
  storyColumn(cv, 528, 800, 460, 'SPORT',
    ['ALCARAZ FACES ZVEREV', 'FOR THE ATP TITLE'],
    'THE SPANIARD BEAT BEN SHELTON IN A COMEBACK TO REACH THE FINAL.',
    2);
  cv.line(512, 800, 512, 946, GREY, 1);
  rule(cv, 36, 964, 952, 2);
}

function footer(cv: Canvas): void {
  drawBlock(cv,
    'ALSO: FBI PROBES APPARENT HACK OF ITS CRIME DATABASE - 6.7 MAGNITUDE QUAKE HITS PERU\'S ANDES, NO CASUALTIES',
    36, 976, 2, 952, INK);
  drawText(cv, 'SOURCES: BBC, REUTERS, THE INDEPENDENT, IANS - 22 NOV 2026', 36, 1010, 2, GREY);
}

function main(): void {
  const cv = new Canvas(W, H, PAPER);
  masthead(cv);
  leadStory(cv);
  middleRow(cv);
  bottomRow(cv);
  footer(cv);
  const png = encodePng(cv);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'entry.png'), png);
}

main();
