import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const PUB = 'public';
const ARTISTS = 'public/artists';
const COVERS = 'public/covers';

// PRNG determinista (mulberry32) para resultados reproducibles.
let _s = 0x9e3779b9;
const rnd = () => { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const between = (a, b) => a + (b - a) * rnd();
const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

const artistFiles = fs.readdirSync(ARTISTS).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f)).map(f => path.join(ARTISTS, f));
// Portadas coloridas/icónicas para dar textura.
const coverPicks = [
  'lana-del-rey-born-to-die', 'daft-punk-discovery', 'daft-punk-random-access-memories',
  'kendrick-lamar-good-kid-m-a-a-d-city', 'tame-impala-currents', 'marvin-gaye-what-s-going-on',
  'stevie-wonder-songs-in-the-key-of-life', 'nick-drake-pink-moon', 'a-tribe-called-quest-the-low-end-theory',
  'bob-dylan-highway-61-revisited', 'kendrick-lamar-to-pimp-a-butterfly', 'fleetwood-mac-rumours',
];
const coverFiles = coverPicks
  .map(n => fs.readdirSync(COVERS).find(f => f.startsWith(n)))
  .filter(Boolean).map(f => path.join(COVERS, f));

// Lienzo de trabajo (con margen para sangrado) -> se recorta al centro.
const OUT_W = 1200, OUT_H = 470;
const M = 210;                         // margen de sangrado
const W = OUT_W + M * 2, H = OUT_H + M * 2;

// Bloques de color vivos de fondo (asoman entre los recortes).
const COLORS = ['#FF2D95', '#00B3A4', '#FFD400', '#FF6A00', '#2B2BFF', '#FF3B3B', '#13C56B'];
async function background() {
  const base = sharp({ create: { width: W, height: H, channels: 4, background: '#FF2D95' } });
  const blocks = [];
  for (let i = 0; i < 7; i++) {
    const bw = Math.round(between(420, 760)), bh = Math.round(between(360, 680));
    const col = COLORS[i % COLORS.length];
    const buf = await sharp({ create: { width: bw, height: bh, channels: 4, background: col } })
      .rotate(Math.round(between(-20, 20)), { background: '#00000000' }).png().toBuffer();
    blocks.push({ input: buf, left: Math.round(between(-100, W - bw + 100)), top: Math.round(between(-100, H - bh + 100)) });
  }
  return base.composite(blocks).png().toBuffer();
}

// Una "foto recortada": cover-fit al tamaño, borde blanco de polaroid, leve rotación.
async function tile(file, size) {
  const border = Math.round(size * 0.035) + 5;
  const inner = await sharp(file).resize(size, size, { fit: 'cover', position: 'attention' }).toBuffer();
  const framed = await sharp(inner)
    .extend({ top: border, bottom: border, left: border, right: border, background: '#FFFFFF' })
    .toBuffer();
  return sharp(framed).rotate(Math.round(between(-13, 13)), { background: '#00000000' }).png().toBuffer();
}

// Acentos pop en SVG (vinilo, estrella, interrogación, destellos).
function accents() {
  const out = [];
  const star = (x, y, r, c) => `<g transform="translate(${x},${y})"><path d="M0,${-r} L${r*0.28},${-r*0.28} L${r},${-r*0.18} L${r*0.38},${r*0.22} L${r*0.6},${r} L0,${r*0.45} L${-r*0.6},${r} L${-r*0.38},${r*0.22} L${-r},${-r*0.18} L${-r*0.28},${-r*0.28} Z" fill="${c}"/></g>`;
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(${M+540},${M+250})"><circle r="120" fill="#111"/><circle r="120" fill="none" stroke="#333" stroke-width="2"/><circle r="78" fill="none" stroke="#555" stroke-width="1.5"/><circle r="40" fill="#FF2D95"/><circle r="8" fill="#111"/></g>
    ${star(M+120, M+90, 46, '#FFD400')}
    ${star(M+1060, M+360, 40, '#00E0FF')}
    ${star(M+980, M+70, 30, '#FF3B3B')}
    <text x="${M+250}" y="${M+420}" font-family="Arial Black, Arial" font-weight="900" font-size="140" fill="#FF2D95" transform="rotate(-8 ${M+250} ${M+420})">?</text>
  </svg>`;
  out.push({ input: Buffer.from(svg), left: 0, top: 0 });
  return out;
}

async function main() {
  const sources = [...artistFiles, ...artistFiles, ...coverFiles]; // artistas con más peso
  const cols = 6, rows = 3;
  const cellW = OUT_W / cols, cellH = OUT_H / rows;
  const tiles = [];
  let k = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const size = Math.round(between(195, 285));
      const file = sources[(k * 7 + 3) % sources.length];
      k++;
      const buf = await tile(file, size);
      const meta = await sharp(buf).metadata();
      // centro de la celda (desplazado por el margen) + jitter
      const cx = M + c * cellW + cellW / 2 + between(-cellW * 0.32, cellW * 0.32);
      const cy = M + r * cellH + cellH / 2 + between(-cellH * 0.32, cellH * 0.32);
      let left = Math.round(cx - meta.width / 2);
      let top = Math.round(cy - meta.height / 2);
      left = Math.max(0, Math.min(W - meta.width, left));
      top = Math.max(0, Math.min(H - meta.height, top));
      tiles.push({ input: buf, left, top, z: rnd() });
    }
  }
  tiles.sort((a, b) => a.z - b.z);

  const bg = await background();
  const composed = await sharp(bg)
    .composite([...tiles.map(({ input, left, top }) => ({ input, left, top })), ...accents()])
    .png().toBuffer();

  const final = await sharp(composed)
    .extract({ left: M, top: M, width: OUT_W, height: OUT_H })
    .jpeg({ quality: 86, mozjpeg: true })
    .toBuffer();

  fs.writeFileSync('public/email/collage.jpg', final);
  const kb = Math.round(final.length / 1024);
  console.log('OK collage.jpg', OUT_W + 'x' + OUT_H, kb + ' KB', '| tiles:', tiles.length);
}
main().catch(e => { console.error(e); process.exit(1); });
