import type { Prisma } from "@prisma/client";

/** Disco con todas sus relaciones (ficha de producto). */
export type RecordWithRelations = Prisma.RecordGetPayload<{
  include: { artist: true; genre: true; images: true; tracks: true };
}>;

/** Disco para tarjetas de catálogo / home (sin tracklist). */
export type RecordCard = Prisma.RecordGetPayload<{
  include: { artist: true; genre: true; images: true };
}>;

/** Artista con sus discos (página de artista). */
export type ArtistWithRecords = Prisma.ArtistGetPayload<{
  include: {
    records: { include: { artist: true; genre: true; images: true } };
  };
}>;

/** Facetas para la barra de filtros del catálogo. */
export interface FilterFacets {
  genres: { id: string; name: string; slug: string; _count: { records: number } }[];
  artists: { name: string; slug: string; _count: { records: number } }[];
  decades: number[];
  minPrice: number; // céntimos
  maxPrice: number; // céntimos
}

/** Línea del carrito (estado en cliente, vía Zustand). */
export interface CartItem {
  id: string;
  slug: string;
  title: string;
  artist: string;
  priceCents: number;
  image: string;
  condition: string;
  quantity: number;
  stock: number;
}
