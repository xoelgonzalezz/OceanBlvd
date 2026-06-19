// Genera la imagen de cabecera de los emails: public/email/collage.jpg
//
// Collage en capas (estilo "record wall"): fotos de artista + portadas + vinilos
// de colores superpuestos, con el sello "Ocean Blvd Vinyl" en Fraunces.
// Reglas: UNA imagen por artista (nunca el mismo dos veces), sin imágenes
// bloqueadas (BLOCK), y los artistas de PRIORITY siempre salen.
//
// Requiere (solo para regenerar, no en el build): sharp + dos paquetes de dev:
//   npm i -D @resvg/resvg-js @expo-google-fonts/fraunces
// Ejecutar: node scripts/generate-email-collage.mjs
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { Resvg } from "@resvg/resvg-js";

const COVERS = "public/covers", ARTISTS = "public/artists";
const F = "node_modules/@expo-google-fonts/fraunces";
let _s = 0x2c9f6ad3;
const rnd = () => { _s |= 0; _s = (_s + 0x6D2B79F5) | 0; let t = Math.imul(_s ^ (_s >>> 15), 1 | _s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const between = (a, b) => a + (b - a) * rnd();
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// Imágenes que no usamos (la cara deformada de Aphex Twin daba mal rollo).
const BLOCK = new Set(["aphex-twin.jpg", "aphex-twin-richard-d-james-album.jpg"]);
// Artistas que deben aparecer siempre (los más representativos de la tienda).
const PRIORITY = ["charli-xcx", "olivia-rodrigo"];

const ARTIST_SLUGS = fs.readdirSync(ARTISTS).filter(f => /\.(jpe?g|png|webp)$/i.test(f)).map(f => f.replace(/\.[^.]+$/, ""));
const allCovers = fs.readdirSync(COVERS).filter(f => /\.(jpe?g|png|webp)$/i.test(f) && !BLOCK.has(f));

function artistImage(slug, i) {
  const photo = `${ARTISTS}/${slug}.jpg`;
  const hasPhoto = fs.existsSync(photo) && !BLOCK.has(`${slug}.jpg`);
  const covers = allCovers.filter(f => f.startsWith(slug + "-"));
  const wantCover = i % 3 === 2 && covers.length; // ~1 de cada 3 como portada
  if (wantCover) return path.join(COVERS, covers[Math.floor(rnd() * covers.length)]);
  if (hasPhoto) return photo;
  if (covers.length) return path.join(COVERS, covers[0]);
  return null;
}
let pool = shuffle(ARTIST_SLUGS.map((s, i) => artistImage(s, i)).filter(Boolean));
const isPrio = (p) => PRIORITY.some(n => p.includes(n));
pool = [...pool.filter(isPrio), ...pool.filter(p => !isPrio(p))];

function vinyl(size, { disc, groove, label }) { const c = size / 2, g = []; for (let r = size * 0.46; r > size * 0.22; r -= size * 0.028) g.push(`<circle cx="${c}" cy="${c}" r="${r}" fill="none" stroke="${groove}" stroke-width="1.2" stroke-opacity="0.6"/>`); return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${c}" cy="${c}" r="${c}" fill="${disc}"/>${g.join("")}<circle cx="${c}" cy="${c}" r="${size * 0.2}" fill="${label}"/><circle cx="${c}" cy="${c}" r="${size * 0.025}" fill="#0e0d0c"/></svg>`); }
const VINYLS = [{ disc: "#16130f", groove: "#5a5550", label: "#E8612C" }, { disc: "#D8472A", groove: "#9c2e18", label: "#F2E9D8" }, { disc: "#16130f", groove: "#5a5550", label: "#F2E9D8" }, { disc: "#E89A2C", groove: "#a86a14", label: "#16130f" }, { disc: "#16130f", groove: "#5a5550", label: "#C44569" }];

async function frame(file, size) { const inner = await sharp(file).resize(size, size, { fit: "cover", position: "attention" }).toBuffer(); const b = Math.round(size * 0.03) + 4; return sharp(inner).extend({ top: b, bottom: b, left: b, right: b, background: "#FBF8F1" }).png().toBuffer(); }
const rotate = (buf, deg) => sharp(buf).rotate(deg, { background: "#00000000" }).png().toBuffer();

function badge(bw, bh) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${bw}" height="${bh}"><rect x="3" y="3" width="${bw - 6}" height="${bh - 6}" rx="18" fill="#FBF8F1" stroke="#16130f" stroke-width="2"/><text x="${bw / 2}" y="48" text-anchor="middle" fill="#8a8379" font-family="Fraunces" font-weight="500" font-size="19" letter-spacing="7">EST. 2026</text><text x="${bw / 2}" y="110" text-anchor="middle" fill="#16130f" font-family="Fraunces" font-weight="700" font-size="60">Ocean Blvd</text><text x="${bw / 2}" y="145" text-anchor="middle" fill="#8a8379" font-family="Fraunces" font-weight="500" font-size="22" letter-spacing="15">VINYL</text></svg>`;
  return new Resvg(svg, { font: { loadSystemFonts: false, defaultFontFamily: "Fraunces", fontFiles: [`${F}/500Medium/Fraunces_500Medium.ttf`, `${F}/700Bold/Fraunces_700Bold.ttf`] } }).render().asPng();
}

const OUT_W = 1000, OUT_H = 1250, M = 240, W = OUT_W + 2 * M, H = OUT_H + 2 * M;
async function main() {
  const cols = 4, rows = 5, total = cols * rows, cw = OUT_W / cols, ch = OUT_H / rows;
  const vinylCells = new Set(shuffle([...Array(total).keys()]).slice(0, 6)); // repartidos
  let pidx = 0, vi = 0; const items = []; let k = 0;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const size = Math.round(between(265, 360));
    let buf;
    if (vinylCells.has(k) || pidx >= pool.length) buf = vinyl(size, VINYLS[vi++ % VINYLS.length]);
    else buf = await frame(pool[pidx++], size);
    buf = await rotate(buf, Math.round(between(-13, 13)));
    const m = await sharp(buf).metadata();
    const cx = M + c * cw + cw / 2 + between(-cw * 0.30, cw * 0.30), cy = M + r * ch + ch / 2 + between(-ch * 0.30, ch * 0.30);
    let left = Math.round(cx - m.width / 2), top = Math.round(cy - m.height / 2);
    left = Math.max(-80, Math.min(W - m.width + 80, left)); top = Math.max(-80, Math.min(H - m.height + 80, top));
    items.push({ input: buf, left, top, z: rnd() }); k++;
  }
  items.sort((a, b) => a.z - b.z);
  const bw = 540, bh = 190, bx = M + OUT_W / 2 - bw / 2, by = M + OUT_H / 2 - bh / 2;
  const composed = await sharp({ create: { width: W, height: H, channels: 4, background: "#15110e" } })
    .composite([...items.map(({ input, left, top }) => ({ input, left, top })), { input: badge(bw, bh), left: Math.round(bx), top: Math.round(by) }]).png().toBuffer();
  const final = await sharp(composed).extract({ left: M, top: M, width: OUT_W, height: OUT_H }).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
  fs.writeFileSync("public/email/collage.jpg", final);
  console.log("OK collage.jpg", OUT_W + "x" + OUT_H, Math.round(final.length / 1024) + "KB | artistas:", pidx);
}
main().catch(e => { console.error(e); process.exit(1); });
