import { PrismaClient } from "@prisma/client";
import seedJson from "./seed-data.json";

const db = new PrismaClient();

/* ---------- Tipos de los datos de semilla ---------- */
interface SeedTrack {
  position: number;
  title: string;
  duration: string;
}
interface SeedAlbum {
  title: string;
  year: number;
  label: string;
  condition: string;
  mediaGrade: string;
  priceCents: number;
  description: string;
  salesCount: number;
  featured: boolean;
  stock: number;
  tracks: SeedTrack[];
  coverUrl?: string; // portada real remota (iTunes / Deezer)
  coverLocal?: string; // portada descargada a /public/covers
  descriptionEn?: string; // descripción traducida al inglés
}
interface SeedArtist {
  name: string;
  slug: string;
  genreSlug: string;
  data: {
    bio: string;
    bioEn?: string; // bio traducida al inglés
    country: string;
    foundedYear: number;
    albums: SeedAlbum[];
    imageUrl?: string; // foto real (Wikipedia)
  };
}
interface SeedBlogPost {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tag: string;
  daysAgo: number;
  coverLocal?: string; // foto real descargada a /public/blog
  excerptEn?: string;
  contentEn?: string;
}
interface SeedShape {
  artists: SeedArtist[];
  blog: { posts: SeedBlogPost[] };
}

const data = seedJson as unknown as SeedShape;

/* ---------- Helpers ---------- */
function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
const decadeOf = (year: number) => Math.floor(year / 10) * 10;
const pad = (n: number) => String(n).padStart(2, "0");
const DAY = 86_400_000;

/* ---------- Géneros ---------- */
const GENRES = [
  { name: "Rock", slug: "rock", description: "Del clásico al progresivo, psicodélico e indie.", descriptionEn: "From classic to progressive, psychedelic and indie." },
  { name: "Jazz", slug: "jazz", description: "Bebop, cool, modal y fusión.", descriptionEn: "Bebop, cool, modal and fusion." },
  { name: "Hip-Hop", slug: "hip-hop", description: "Boom bap, conciencia y vanguardia.", descriptionEn: "Boom bap, conscious and cutting-edge." },
  { name: "Electrónica", slug: "electronica", description: "House, techno, ambient e IDM.", descriptionEn: "House, techno, ambient and IDM." },
  { name: "Clásica", slug: "clasica", description: "Contemporánea, minimalista y de cámara.", descriptionEn: "Contemporary, minimalist and chamber." },
  { name: "Soul & Funk", slug: "soul-funk", description: "Motown, groove y ritmo con alma.", descriptionEn: "Motown, groove and soulful rhythm." },
  { name: "Pop", slug: "pop", description: "Melodías que definen una época.", descriptionEn: "Melodies that define an era." },
  { name: "Folk", slug: "folk", description: "Cantautores y raíces acústicas.", descriptionEn: "Singer-songwriters and acoustic roots." },
];

// Artistas que aparecerán destacados en el home.
const FEATURED_ARTISTS = new Set([
  "pink-floyd",
  "miles-davis",
  "kendrick-lamar",
  "daft-punk",
  "lana-del-rey",
  "marvin-gaye",
]);

async function main() {
  console.log("🌱 Sembrando Ocean Blvd Vinyl...");

  // Limpieza (en orden por dependencias).
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.track.deleteMany();
  await db.recordImage.deleteMany();
  await db.record.deleteMany();
  await db.artist.deleteMany();
  await db.genre.deleteMany();
  await db.blogPost.deleteMany();
  await db.newsletterSubscriber.deleteMany();
  await db.contactMessage.deleteMany();

  // Géneros.
  const genreBySlug: Record<string, string> = {};
  for (const g of GENRES) {
    const created = await db.genre.create({ data: g });
    genreBySlug[g.slug] = created.id;
  }
  console.log(`  ✔ ${GENRES.length} géneros`);

  // Artistas + discos.
  let recordIndex = 0;
  for (let ai = 0; ai < data.artists.length; ai++) {
    const a = data.artists[ai];
    const genreId = genreBySlug[a.genreSlug];
    if (!genreId) {
      console.warn(`  ⚠ género desconocido "${a.genreSlug}" para ${a.name}`);
      continue;
    }

    const artist = await db.artist.create({
      data: {
        name: a.name,
        slug: a.slug,
        bio: a.data.bio,
        bioEn: a.data.bioEn ?? null,
        country: a.data.country,
        foundedYear: a.data.foundedYear,
        image: a.data.imageUrl ?? `/placeholders/artist-${pad((ai % 6) + 1)}.svg`,
        featured: FEATURED_ARTISTS.has(a.slug),
      },
    });

    for (const alb of a.data.albums) {
      const ci = recordIndex % 12;
      // Dispersamos las fechas de alta para que "Novedades" tenga variedad.
      const offsetDays = (recordIndex * 13 + 7) % 95;

      await db.record.create({
        data: {
          title: alb.title,
          slug: slugify(`${a.name} ${alb.title}`),
          label: alb.label,
          year: alb.year,
          decade: decadeOf(alb.year),
          priceCents: alb.priceCents,
          condition: alb.condition,
          mediaGrade: alb.mediaGrade,
          description: alb.description,
          descriptionEn: alb.descriptionEn ?? null,
          stock: alb.stock,
          salesCount: alb.salesCount,
          featured: alb.featured,
          createdAt: new Date(Date.now() - offsetDays * DAY),
          artistId: artist.id,
          genreId,
          images: {
            create: [
              {
                url:
                  alb.coverLocal ??
                  alb.coverUrl ??
                  `/placeholders/cover-${pad(ci + 1)}.svg`,
                alt: `Portada de ${alb.title} de ${a.name}`,
                position: 0,
              },
            ],
          },
          tracks: {
            create: alb.tracks.map((t) => ({
              position: t.position,
              title: t.title,
              duration: t.duration,
            })),
          },
        },
      });
      recordIndex++;
    }
  }
  console.log(`  ✔ ${data.artists.length} artistas y ${recordIndex} discos`);

  // Blog.
  for (let i = 0; i < data.blog.posts.length; i++) {
    const p = data.blog.posts[i];
    await db.blogPost.create({
      data: {
        title: p.title,
        slug: slugify(p.title),
        excerpt: p.excerpt,
        excerptEn: p.excerptEn ?? null,
        content: p.content,
        contentEn: p.contentEn ?? null,
        author: p.author,
        tag: p.tag,
        coverImage: p.coverLocal ?? `/placeholders/blog-${pad((i % 6) + 1)}.svg`,
        publishedAt: new Date(Date.now() - (p.daysAgo || 10) * DAY),
      },
    });
  }
  console.log(`  ✔ ${data.blog.posts.length} artículos de blog`);

  console.log("✅ Semilla completada.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
