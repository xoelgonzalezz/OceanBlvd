/**
 * Descarga a almacenamiento propio todas las imágenes de producto que ahora
 * mismo se sirven desde dominios de terceros (Discogs, etc.), las convierte a
 * WebP y actualiza las referencias en la base de datos.
 *
 * Por qué: hotlinkear imágenes ajenas es frágil (se rompen), malo para el SEO
 * de imágenes y, en segunda mano, el comprador quiere ver TU copia real. Este
 * script deja todas las imágenes en /public/products/ servidas desde tu dominio.
 *
 * Es idempotente: las imágenes ya locales (que empiezan por "/") se ignoran, y
 * si el archivo de destino ya existe no se vuelve a descargar.
 *
 * Uso:
 *   npx tsx scripts/self-host-images.ts            # descarga y actualiza la BD
 *   npx tsx scripts/self-host-images.ts --dry-run  # solo informa, no toca nada
 *
 * Requiere las variables de entorno de la BD (DATABASE_URL / DIRECT_URL).
 */
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { PrismaClient } from "@prisma/client";
import sharp from "sharp";

const prisma = new PrismaClient();

const OUT_DIR = path.join(process.cwd(), "public", "products");
const PUBLIC_PREFIX = "/products";
const DRY_RUN = process.argv.includes("--dry-run");

/** ¿Es una URL remota que conviene descargar? (no local, no data URI) */
function isRemote(url: string | null | undefined): url is string {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
}

/** Nombre de archivo determinista y estable a partir de la URL original. */
function fileNameFor(url: string): string {
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 16);
  return `${hash}.webp`;
}

type Downloaded = { publicPath: string; bytes: number };

/** Descarga la URL, la convierte a WebP y la guarda. Devuelve la ruta pública. */
async function downloadToWebp(url: string): Promise<Downloaded> {
  const fileName = fileNameFor(url);
  const destPath = path.join(OUT_DIR, fileName);
  const publicPath = `${PUBLIC_PREFIX}/${fileName}`;

  // Si ya existe, no volvemos a descargar (idempotente).
  try {
    const stat = await fs.stat(destPath);
    return { publicPath, bytes: stat.size };
  } catch {
    /* no existe: seguimos y descargamos */
  }

  const res = await fetch(url, {
    headers: { "User-Agent": "OceanBlvdVinyl/1.0 (+https://oceanblvdvinyl.com)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);
  const input = Buffer.from(await res.arrayBuffer());

  // Convertimos a WebP (buen tamaño/calidad y soporte universal). Limitamos el
  // ancho máximo para no guardar originales enormes.
  const output = await sharp(input)
    .rotate()
    .resize({ width: 1400, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  await fs.writeFile(destPath, output);
  return { publicPath, bytes: output.length };
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  const images = await prisma.recordImage.findMany({
    select: { id: true, url: true },
  });
  const records = await prisma.record.findMany({
    select: { id: true, vinylImage: true },
  });

  const remoteImages = images.filter((i) => isRemote(i.url));
  const remoteVinyls = records.filter((r) => isRemote(r.vinylImage));
  const totalRemote = remoteImages.length + remoteVinyls.length;

  console.log(
    `Imágenes de galería: ${images.length} (remotas: ${remoteImages.length})`
  );
  console.log(
    `Vinilos (vinylImage): ${records.length} (remotos: ${remoteVinyls.length})`
  );
  if (totalRemote === 0) {
    console.log("✔ No hay imágenes remotas: todo ya está autoalojado.");
    return;
  }
  if (DRY_RUN) {
    console.log(`\n[dry-run] Se descargarían ${totalRemote} imágenes. Sin cambios.`);
    return;
  }

  let ok = 0;
  let failed = 0;

  for (const img of remoteImages) {
    try {
      const { publicPath } = await downloadToWebp(img.url);
      await prisma.recordImage.update({
        where: { id: img.id },
        data: { url: publicPath },
      });
      ok++;
      console.log(`  ✔ ${img.url} → ${publicPath}`);
    } catch (err) {
      failed++;
      console.warn(`  ✗ ${img.url}: ${(err as Error).message}`);
    }
  }

  for (const rec of remoteVinyls) {
    try {
      const { publicPath } = await downloadToWebp(rec.vinylImage as string);
      await prisma.record.update({
        where: { id: rec.id },
        data: { vinylImage: publicPath },
      });
      ok++;
      console.log(`  ✔ ${rec.vinylImage} → ${publicPath}`);
    } catch (err) {
      failed++;
      console.warn(`  ✗ ${rec.vinylImage}: ${(err as Error).message}`);
    }
  }

  console.log(`\nHecho. Actualizadas: ${ok}. Fallidas: ${failed}.`);
  if (failed > 0) {
    console.log(
      "Las fallidas conservan su URL original; puedes reintentar (es idempotente)."
    );
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
