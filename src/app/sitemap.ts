import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";
import {
  getAllArtistSlugs,
  getAllGenreSlugs,
  getAllPostSlugs,
  getAllRecordSlugs,
} from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now = new Date();

  const staticRoutes = [
    "",
    "/tienda",
    "/vinilos/nuevos",
    "/vinilos/segunda-mano",
    "/artistas",
    "/blog",
    "/sobre-nosotros",
    "/contacto",
    "/faq",
    "/envios",
    "/legal/aviso-legal",
    "/legal/privacidad",
    "/legal/condiciones",
    "/legal/devoluciones",
    "/legal/cookies",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
  }));

  const [records, artists, posts, genres] = await Promise.all([
    getAllRecordSlugs(),
    getAllArtistSlugs(),
    getAllPostSlugs(),
    getAllGenreSlugs(),
  ]);

  return [
    ...staticRoutes,
    ...genres.map((g) => ({
      url: `${base}/vinilos/${g.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
    })),
    ...records.map((r) => ({
      url: `${base}/producto/${r.slug}`,
      lastModified: now,
    })),
    ...artists.map((a) => ({
      url: `${base}/artistas/${a.slug}`,
      lastModified: now,
    })),
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: now,
    })),
  ];
}
