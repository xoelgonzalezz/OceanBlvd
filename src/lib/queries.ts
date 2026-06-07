import { db } from "@/lib/db";
import { PAGE_SIZE, type SortValue } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

/* Includes reutilizables */
const cardInclude = {
  artist: true,
  genre: true,
  images: { orderBy: { position: "asc" } },
} satisfies Prisma.RecordInclude;

const fullInclude = {
  artist: true,
  genre: true,
  images: { orderBy: { position: "asc" } },
  tracks: { orderBy: { position: "asc" } },
} satisfies Prisma.RecordInclude;

/* ============== HOME ============== */

/** Disco para el hero: preferimos el álbum "Ocean Blvd" de Lana Del Rey. */
export async function getHeroRecord() {
  const lana = await db.record.findMany({
    where: { artist: { slug: "lana-del-rey" } },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
  });
  const ocean = lana.find((r) => /ocean blvd/i.test(r.title));
  if (ocean) return ocean;
  if (lana.length) return lana[0];
  // Sin Lana: caemos al destacado más vendido.
  return db.record.findFirst({
    where: { featured: true },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
  });
}

export function getFeaturedRecords(limit = 6) {
  return db.record.findMany({
    where: { featured: true },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
    take: limit,
  });
}

export function getNewReleases(limit = 8) {
  return db.record.findMany({
    include: cardInclude,
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export function getBestSellers(limit = 8) {
  return db.record.findMany({
    include: cardInclude,
    orderBy: { salesCount: "desc" },
    take: limit,
  });
}

export function getFeaturedArtists(limit = 6) {
  return db.artist.findMany({
    where: { featured: true },
    include: { _count: { select: { records: true } } },
    orderBy: { name: "asc" },
    take: limit,
  });
}

export function getGenresWithCount() {
  return db.genre.findMany({
    include: { _count: { select: { records: true } } },
    orderBy: { name: "asc" },
  });
}

export function getLatestPosts(limit = 3) {
  return db.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

/* ============== CATÁLOGO ============== */

export interface RecordFilters {
  genres?: string[]; // slugs
  artists?: string[]; // slugs
  decades?: number[];
  conditions?: string[]; // "NEW" | "USED"
  minPrice?: number; // céntimos
  maxPrice?: number; // céntimos
  search?: string;
  sort?: SortValue;
  page?: number;
  pageSize?: number;
}

function buildWhere(f: RecordFilters): Prisma.RecordWhereInput {
  const where: Prisma.RecordWhereInput = {};
  if (f.genres?.length) where.genre = { slug: { in: f.genres } };
  if (f.artists?.length) where.artist = { slug: { in: f.artists } };
  if (f.decades?.length) where.decade = { in: f.decades };
  if (f.conditions?.length) where.condition = { in: f.conditions };
  if (f.minPrice != null || f.maxPrice != null) {
    const price: Prisma.IntFilter = {};
    if (f.minPrice != null) price.gte = f.minPrice;
    if (f.maxPrice != null) price.lte = f.maxPrice;
    where.priceCents = price;
  }
  if (f.search?.trim()) {
    const q = f.search.trim();
    where.OR = [
      { title: { contains: q } },
      { label: { contains: q } },
      { artist: { name: { contains: q } } },
    ];
  }
  return where;
}

function buildOrderBy(sort?: SortValue): Prisma.RecordOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { priceCents: "asc" };
    case "price-desc":
      return { priceCents: "desc" };
    case "popular":
      return { salesCount: "desc" };
    case "az":
      return { title: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function getRecords(filters: RecordFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? PAGE_SIZE;
  const where = buildWhere(filters);

  const [records, total] = await Promise.all([
    db.record.findMany({
      where,
      include: cardInclude,
      orderBy: buildOrderBy(filters.sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.record.count({ where }),
  ]);

  return {
    records,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Datos para construir la barra de filtros del catálogo. */
export async function getFilterFacets() {
  const [genres, artists, decadeRows, priceAgg] = await Promise.all([
    db.genre.findMany({
      include: { _count: { select: { records: true } } },
      orderBy: { name: "asc" },
    }),
    db.artist.findMany({
      select: { name: true, slug: true, _count: { select: { records: true } } },
      orderBy: { name: "asc" },
    }),
    db.record.findMany({
      select: { decade: true },
      distinct: ["decade"],
      orderBy: { decade: "desc" },
    }),
    db.record.aggregate({
      _min: { priceCents: true },
      _max: { priceCents: true },
    }),
  ]);

  return {
    genres,
    artists,
    decades: decadeRows.map((r) => r.decade),
    minPrice: priceAgg._min.priceCents ?? 0,
    maxPrice: priceAgg._max.priceCents ?? 10000,
  };
}

/* ============== PRODUCTO ============== */

export function getRecordBySlug(slug: string) {
  return db.record.findUnique({
    where: { slug },
    include: fullInclude,
  });
}

export function getAllRecordSlugs() {
  return db.record.findMany({ select: { slug: true } });
}

export async function getRelatedRecords(
  record: { id: string; artistId: string; genreId: string },
  limit = 4
) {
  // Primero discos del mismo artista; si faltan, se completan con el mismo género.
  const sameArtist = await db.record.findMany({
    where: { id: { not: record.id }, artistId: record.artistId },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
    take: limit,
  });

  if (sameArtist.length >= limit) return sameArtist;

  const excludeIds = [record.id, ...sameArtist.map((r) => r.id)];
  const sameGenre = await db.record.findMany({
    where: { id: { notIn: excludeIds }, genreId: record.genreId },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
    take: limit - sameArtist.length,
  });

  return [...sameArtist, ...sameGenre];
}

/* ============== ARTISTAS ============== */

export function getArtists() {
  return db.artist.findMany({
    include: { _count: { select: { records: true } } },
    orderBy: { name: "asc" },
  });
}

export function getArtistBySlug(slug: string) {
  return db.artist.findUnique({
    where: { slug },
    include: {
      records: {
        include: cardInclude,
        orderBy: { year: "desc" },
      },
    },
  });
}

export function getAllArtistSlugs() {
  return db.artist.findMany({ select: { slug: true } });
}

/* ============== BLOG ============== */

export function getPosts() {
  return db.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
}

export function getPostBySlug(slug: string) {
  return db.blogPost.findUnique({ where: { slug } });
}

export function getAllPostSlugs() {
  return db.blogPost.findMany({ select: { slug: true } });
}

/* ============== BÚSQUEDA RÁPIDA (⌘K) ============== */

export async function searchRecords(query: string, limit = 8) {
  const q = query.trim();
  if (!q) return [];
  return db.record.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { artist: { name: { contains: q } } },
      ],
    },
    include: cardInclude,
    take: limit,
    orderBy: { salesCount: "desc" },
  });
}

/* ============== CARRITO / CHECKOUT ============== */

/** Recupera discos por id para validar el carrito y calcular totales en servidor. */
export function getRecordsByIds(ids: string[]) {
  return db.record.findMany({
    where: { id: { in: ids } },
    include: cardInclude,
  });
}

/* ============== ADMIN ============== */

export function getAdminRecords() {
  return db.record.findMany({
    include: { artist: true, images: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getRecordForEdit(id: string) {
  return db.record.findUnique({
    where: { id },
    include: {
      tracks: { orderBy: { position: "asc" } },
      images: { orderBy: { position: "asc" } },
    },
  });
}

export function getArtistsBasic() {
  return db.artist.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export function getGenresBasic() {
  return db.genre.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export function getAdminArtists() {
  return db.artist.findMany({
    include: { _count: { select: { records: true } } },
    orderBy: { name: "asc" },
  });
}

export function getArtistForEdit(id: string) {
  return db.artist.findUnique({ where: { id } });
}

export function getAdminPosts() {
  return db.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
}

export function getPostForEdit(id: string) {
  return db.blogPost.findUnique({ where: { id } });
}

/** Pedidos de un usuario (área de cuenta). */
export function getUserOrders(userId: string) {
  return db.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          record: {
            include: { artist: true, images: { orderBy: { position: "asc" } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Pedido con sus líneas (página de confirmación). */
export function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          record: {
            include: {
              artist: true,
              images: { orderBy: { position: "asc" } },
            },
          },
        },
      },
    },
  });
}
