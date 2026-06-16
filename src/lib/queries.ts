import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { PAGE_SIZE, type SortValue } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

// Etiquetas de caché; se invalidan desde el admin / checkout al cambiar datos.
export const TAGS = {
  records: "records",
  artists: "artists",
  blog: "blog",
  genres: "genres",
} as const;

const DAY = 86400; // segundo de respaldo; la invalidación real es por etiqueta

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
export const getHeroRecord = unstable_cache(
  async () => {
    const lana = await db.record.findMany({
      where: { archived: false, artist: { slug: "lana-del-rey" } },
      include: cardInclude,
      orderBy: { salesCount: "desc" },
    });
    const ocean = lana.find((r) => /ocean blvd/i.test(r.title));
    if (ocean) return ocean;
    if (lana.length) return lana[0];
    return db.record.findFirst({
      where: { archived: false, featured: true },
      include: cardInclude,
      orderBy: { salesCount: "desc" },
    });
  },
  ["hero-record"],
  { tags: [TAGS.records], revalidate: DAY }
);

export const getFeaturedRecords = (limit = 6) =>
  unstable_cache(
    (l: number) =>
      db.record.findMany({
        where: { archived: false, featured: true },
        include: cardInclude,
        orderBy: { salesCount: "desc" },
        take: l,
      }),
    ["featured-records"],
    { tags: [TAGS.records], revalidate: DAY }
  )(limit);

export const getNewReleases = (limit = 8) =>
  unstable_cache(
    (l: number) =>
      db.record.findMany({
        where: { archived: false },
        include: cardInclude,
        orderBy: { createdAt: "desc" },
        take: l,
      }),
    ["new-releases"],
    { tags: [TAGS.records], revalidate: DAY }
  )(limit);

export const getBestSellers = (limit = 8) =>
  unstable_cache(
    (l: number) =>
      db.record.findMany({
        where: { archived: false },
        include: cardInclude,
        orderBy: { salesCount: "desc" },
        take: l,
      }),
    ["best-sellers"],
    { tags: [TAGS.records], revalidate: DAY }
  )(limit);

export const getFeaturedArtists = (limit = 6) =>
  unstable_cache(
    (l: number) =>
      db.artist.findMany({
        where: { archived: false, featured: true },
        include: { _count: { select: { records: { where: { archived: false } } } } },
        orderBy: { name: "asc" },
        take: l,
      }),
    ["featured-artists"],
    { tags: [TAGS.artists, TAGS.records], revalidate: DAY }
  )(limit);

export const getGenresWithCount = unstable_cache(
  () =>
    db.genre.findMany({
      include: { _count: { select: { records: { where: { archived: false } } } } },
      orderBy: { name: "asc" },
    }),
  ["genres-with-count"],
  { tags: [TAGS.genres, TAGS.records], revalidate: DAY }
);

export const getLatestPosts = (limit = 3) =>
  unstable_cache(
    (l: number) =>
      db.blogPost.findMany({ orderBy: { publishedAt: "desc" }, take: l }),
    ["latest-posts"],
    { tags: [TAGS.blog], revalidate: DAY }
  )(limit);

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
  // Los discos archivados nunca aparecen en el catálogo.
  const where: Prisma.RecordWhereInput = { archived: false };
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
      { title: { contains: q, mode: "insensitive" } },
      { label: { contains: q, mode: "insensitive" } },
      { artist: { name: { contains: q, mode: "insensitive" } } },
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
export const getFilterFacets = unstable_cache(
  async () => {
  const [genres, artists, decadeRows, priceAgg] = await Promise.all([
    db.genre.findMany({
      // Solo géneros con al menos 1 disco no archivado: el sidebar de filtros no
      // debe mostrar géneros vacíos.
      where: { records: { some: { archived: false } } },
      include: { _count: { select: { records: { where: { archived: false } } } } },
      orderBy: { name: "asc" },
    }),
    db.artist.findMany({
      where: { archived: false },
      select: {
        name: true,
        slug: true,
        _count: { select: { records: { where: { archived: false } } } },
      },
      orderBy: { name: "asc" },
    }),
    db.record.findMany({
      where: { archived: false },
      select: { decade: true },
      distinct: ["decade"],
      orderBy: { decade: "desc" },
    }),
    db.record.aggregate({
      where: { archived: false },
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
  },
  ["filter-facets"],
  { tags: [TAGS.records, TAGS.genres, TAGS.artists], revalidate: DAY }
);

/* ============== PRODUCTO ============== */

export const getRecordBySlug = (slug: string) =>
  unstable_cache(
    // findFirst (no findUnique) para poder excluir los archivados: un disco
    // archivado deja de tener página de producto (404).
    (s: string) =>
      db.record.findFirst({
        where: { slug: s, archived: false },
        include: fullInclude,
      }),
    ["record-by-slug"],
    { tags: [TAGS.records], revalidate: DAY }
  )(slug);

export function getAllRecordSlugs() {
  return db.record.findMany({ where: { archived: false }, select: { slug: true } });
}

export async function getRelatedRecords(
  record: { id: string; artistId: string; genreId: string },
  limit = 4
) {
  // Primero discos del mismo artista; si faltan, se completan con el mismo género.
  const sameArtist = await db.record.findMany({
    where: { archived: false, id: { not: record.id }, artistId: record.artistId },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
    take: limit,
  });

  if (sameArtist.length >= limit) return sameArtist;

  const excludeIds = [record.id, ...sameArtist.map((r) => r.id)];
  const sameGenre = await db.record.findMany({
    where: { archived: false, id: { notIn: excludeIds }, genreId: record.genreId },
    include: cardInclude,
    orderBy: { salesCount: "desc" },
    take: limit - sameArtist.length,
  });

  return [...sameArtist, ...sameGenre];
}

/* ============== ARTISTAS ============== */

export const getArtists = unstable_cache(
  () =>
    db.artist.findMany({
      where: { archived: false },
      include: { _count: { select: { records: { where: { archived: false } } } } },
      orderBy: { name: "asc" },
    }),
  ["artists-list"],
  { tags: [TAGS.artists, TAGS.records], revalidate: DAY }
);

export const getArtistBySlug = (slug: string) =>
  unstable_cache(
    // findFirst para excluir artistas archivados; sus discos archivados tampoco
    // se muestran en la ficha.
    (s: string) =>
      db.artist.findFirst({
        where: { slug: s, archived: false },
        include: {
          records: {
            where: { archived: false },
            include: cardInclude,
            orderBy: { year: "desc" },
          },
        },
      }),
    ["artist-by-slug"],
    { tags: [TAGS.artists, TAGS.records], revalidate: DAY }
  )(slug);

export function getAllArtistSlugs() {
  return db.artist.findMany({ where: { archived: false }, select: { slug: true } });
}

/* ============== BLOG ============== */

export const getPosts = unstable_cache(
  () => db.blogPost.findMany({ orderBy: { publishedAt: "desc" } }),
  ["posts-list"],
  { tags: [TAGS.blog], revalidate: DAY }
);

export const getPostBySlug = (slug: string) =>
  unstable_cache(
    (s: string) => db.blogPost.findUnique({ where: { slug: s } }),
    ["post-by-slug"],
    { tags: [TAGS.blog], revalidate: DAY }
  )(slug);

export function getAllPostSlugs() {
  return db.blogPost.findMany({ select: { slug: true } });
}

/* ============== BÚSQUEDA RÁPIDA (⌘K) ============== */

export async function searchRecords(query: string, limit = 8) {
  const q = query.trim();
  if (!q) return [];
  return db.record.findMany({
    where: {
      archived: false,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { artist: { name: { contains: q, mode: "insensitive" } } },
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
  // archived:false → un disco "borrado" no se puede comprar aunque siga en un carrito.
  return db.record.findMany({
    where: { archived: false, id: { in: ids } },
    include: cardInclude,
  });
}

/**
 * ¿El usuario tiene una compra verificada de este disco?
 * Cuenta como verificada si existe un pedido pagado o enviado (PAID/SHIPPED) que
 * contiene el disco y pertenece al usuario, ya sea por su userId o por el email
 * de su cuenta (cubre las compras hechas como invitado con ese mismo correo).
 */
export async function hasPurchasedRecord(
  userId: string,
  email: string,
  recordId: string
): Promise<boolean> {
  const order = await db.order.findFirst({
    where: {
      status: { in: ["PAID", "SHIPPED"] },
      OR: [{ userId }, { email }],
      items: { some: { recordId } },
    },
    select: { id: true },
  });
  return Boolean(order);
}

/* ============== ADMIN ============== */

export function getAdminRecords() {
  // Los archivados quedan fuera del panel: para el admin están "borrados".
  return db.record.findMany({
    where: { archived: false },
    include: { artist: true, images: { orderBy: { position: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
}

export function getRecordForEdit(id: string) {
  // findFirst (no findUnique) para excluir archivados: la página de edición
  // hace notFound() (404) y así no se edita por error un disco "borrado".
  return db.record.findFirst({
    where: { id, archived: false },
    include: {
      tracks: { orderBy: { position: "asc" } },
      images: { orderBy: { position: "asc" } },
    },
  });
}

export function getArtistsBasic() {
  return db.artist.findMany({
    where: { archived: false },
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
    where: { archived: false },
    include: { _count: { select: { records: { where: { archived: false } } } } },
    orderBy: { name: "asc" },
  });
}

export function getArtistForEdit(id: string) {
  // findFirst para excluir archivados: la página de edición hace notFound()
  // (404) y así no se edita por error un artista "borrado".
  return db.artist.findFirst({ where: { id, archived: false } });
}

export function getAdminPosts() {
  return db.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
}

export function getAdminUsers() {
  return db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      provider: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/** Todos los pedidos para el panel de admin (gestión de envíos). */
export function getAdminOrders() {
  return db.order.findMany({
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

export function getPostForEdit(id: string) {
  return db.blogPost.findUnique({ where: { id } });
}

/* ============== RESEÑAS ============== */

export function getRecordReviews(recordId: string) {
  return db.review.findMany({
    where: { recordId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRecordRating(recordId: string) {
  const agg = await db.review.aggregate({
    where: { recordId },
    _avg: { rating: true },
    _count: true,
  });
  return { avg: agg._avg.rating ?? 0, count: agg._count };
}

export function getUserReview(userId: string, recordId: string) {
  return db.review.findUnique({
    where: { userId_recordId: { userId, recordId } },
  });
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

/**
 * Pedido para la página de confirmación, con control de acceso:
 * solo se devuelve si coincide el token aleatorio o si es del usuario en sesión.
 */
export async function getOrderForConfirmation(
  id: string,
  token?: string,
  userId?: string
) {
  const order = await getOrderById(id);
  if (!order) return null;
  const byToken = Boolean(token && order.accessToken && order.accessToken === token);
  const byOwner = Boolean(userId && order.userId === userId);
  return byToken || byOwner ? order : null;
}
