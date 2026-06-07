// Genera placeholders SVG elegantes (paleta terracota/crema) en /public/placeholders.
// Portadas con motivo de vinilo, retratos de artista y cabeceras de blog.
import { writeFileSync, mkdirSync } from "node:fs";

mkdirSync("public/placeholders", { recursive: true });

const COVER_PALETTES = [
  ["#1a1714", "#3a2a20", "#e9ddc8"],
  ["#2a1610", "#c65d3b", "#f3e7d6"],
  ["#c65d3b", "#e7a87c", "#2a1610"],
  ["#1d2a27", "#3c5651", "#e9ddc8"],
  ["#2b2018", "#8a5a3c", "#f3e7d6"],
  ["#0f0e0c", "#2a2622", "#e9ddc8"],
  ["#d9c4a3", "#a8825a", "#241a12"],
  ["#3a2a1c", "#c9a227", "#241a12"],
  ["#4a2520", "#c65d3b", "#f3e7d6"],
  ["#16130f", "#5a3a28", "#e9ddc8"],
  ["#ead9bf", "#c65d3b", "#2a1610"],
  ["#221a14", "#7a4a30", "#f3e7d6"],
];

function cover(i, [from, to, ink]) {
  const id = `g${i}`;
  // disco de vinilo desplazado a la derecha con surcos concéntricos
  const grooves = Array.from({ length: 9 }, (_, k) => {
    const r = 70 + k * 18;
    return `<circle cx="430" cy="300" r="${r}" fill="none" stroke="${ink}" stroke-opacity="0.10" stroke-width="1.5"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#${id})"/>
  ${grooves}
  <circle cx="430" cy="300" r="248" fill="none" stroke="${ink}" stroke-opacity="0.16" stroke-width="2"/>
  <circle cx="430" cy="300" r="58" fill="${ink}" fill-opacity="0.14"/>
  <circle cx="430" cy="300" r="10" fill="${ink}" fill-opacity="0.5"/>
  <text x="48" y="540" fill="${ink}" fill-opacity="0.55" font-family="Georgia, serif" font-size="22" letter-spacing="3">OCEAN BLVD</text>
  <text x="48" y="566" fill="${ink}" fill-opacity="0.4" font-family="Arial, sans-serif" font-size="13" letter-spacing="6">VINYL · RECORDS</text>
</svg>`;
}

const ARTIST_PALETTES = [
  ["#1a1714", "#4a3326", "#e9ddc8"],
  ["#2a1610", "#c65d3b", "#f3e7d6"],
  ["#22201c", "#6b5240", "#e9ddc8"],
  ["#3a2a1c", "#a8825a", "#241a12"],
  ["#16130f", "#3c5651", "#e9ddc8"],
  ["#2b1d16", "#8a5a3c", "#f3e7d6"],
];

function artist(i, [from, to, ink]) {
  const id = `a${i}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="${id}v" cx="0.5" cy="0.42" r="0.6">
      <stop offset="0" stop-color="${ink}" stop-opacity="0.18"/>
      <stop offset="1" stop-color="${ink}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#${id})"/>
  <circle cx="300" cy="250" r="150" fill="url(#${id}v)"/>
  <circle cx="300" cy="250" r="150" fill="none" stroke="${ink}" stroke-opacity="0.18" stroke-width="1.5"/>
  <text x="300" y="470" text-anchor="middle" fill="${ink}" fill-opacity="0.5" font-family="Georgia, serif" font-size="20" letter-spacing="4">ARTISTA</text>
</svg>`;
}

const BLOG_PALETTES = [
  ["#1a1714", "#3a2a20", "#e9ddc8"],
  ["#2a1610", "#c65d3b", "#f3e7d6"],
  ["#3a2a1c", "#c9a227", "#241a12"],
  ["#1d2a27", "#3c5651", "#e9ddc8"],
  ["#221a14", "#7a4a30", "#f3e7d6"],
  ["#ead9bf", "#c65d3b", "#2a1610"],
];

function blog(i, [from, to, ink]) {
  const id = `b${i}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#${id})"/>
  <circle cx="980" cy="315" r="210" fill="none" stroke="${ink}" stroke-opacity="0.12" stroke-width="2"/>
  <circle cx="980" cy="315" r="150" fill="none" stroke="${ink}" stroke-opacity="0.12" stroke-width="2"/>
  <circle cx="980" cy="315" r="90" fill="none" stroke="${ink}" stroke-opacity="0.12" stroke-width="2"/>
  <circle cx="980" cy="315" r="14" fill="${ink}" fill-opacity="0.45"/>
  <text x="90" y="330" fill="${ink}" fill-opacity="0.6" font-family="Georgia, serif" font-size="44" letter-spacing="2">El Surco</text>
  <text x="92" y="372" fill="${ink}" fill-opacity="0.4" font-family="Arial, sans-serif" font-size="18" letter-spacing="6">OCEAN BLVD · DIARIO</text>
</svg>`;
}

COVER_PALETTES.forEach((p, i) =>
  writeFileSync(`public/placeholders/cover-${String(i + 1).padStart(2, "0")}.svg`, cover(i, p))
);
ARTIST_PALETTES.forEach((p, i) =>
  writeFileSync(`public/placeholders/artist-${String(i + 1).padStart(2, "0")}.svg`, artist(i, p))
);
BLOG_PALETTES.forEach((p, i) =>
  writeFileSync(`public/placeholders/blog-${String(i + 1).padStart(2, "0")}.svg`, blog(i, p))
);

// Imagen OG por defecto (reutiliza una cabecera de blog).
writeFileSync("public/placeholders/og-default.svg", blog(0, BLOG_PALETTES[1]));

console.log(
  `Generados: ${COVER_PALETTES.length} portadas, ${ARTIST_PALETTES.length} artistas, ${BLOG_PALETTES.length} blog + og-default`
);
