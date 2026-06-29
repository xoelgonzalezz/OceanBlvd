import type { Metadata } from "next";

import { SITE } from "@/lib/constants";
import { getDict } from "@/i18n/server";
import { Hero } from "@/components/home/hero";
import { Marquee } from "@/components/shared/marquee";
import { RecordSection } from "@/components/home/record-section";
import { GenreGrid } from "@/components/home/genre-grid";
import { FeaturedArtists } from "@/components/home/featured-artists";
import { BlogPreview } from "@/components/home/blog-preview";
import {
  getBestSellers,
  getFeaturedArtists,
  getFeaturedRecords,
  getGenresWithCount,
  getHeroRecord,
  getLatestPosts,
  getNewReleases,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: `${SITE.name} — Discos de vinilo, novedades y segunda mano` },
  description: SITE.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [heroRecord, featured, newReleases, bestSellers, genres, artists, posts] =
    await Promise.all([
      getHeroRecord(),
      getFeaturedRecords(8),
      getNewReleases(8),
      getBestSellers(8),
      getGenresWithCount(),
      getFeaturedArtists(6),
      getLatestPosts(3),
    ]);

  // No repetimos en la rejilla el disco que ya sale en grande en el hero.
  const featuredRecords = featured.filter((r) => r.id !== heroRecord?.id);

  const t = getDict();

  return (
    <>
      <Hero record={heroRecord} />

      <Marquee items={[...t.marquee]} />

      <RecordSection
        eyebrow={t.home.featuredEyebrow}
        title={t.home.featuredTitle}
        description={t.home.featuredDesc}
        records={featuredRecords}
        priorityCount={4}
      />

      <RecordSection
        eyebrow={t.home.newEyebrow}
        title={t.home.newTitle}
        description={t.home.newDesc}
        href="/tienda?sort=newest"
        linkLabel={t.home.newLink}
        records={newReleases}
        priorityCount={4}
      />

      <GenreGrid genres={genres} />

      <RecordSection
        eyebrow={t.home.bestEyebrow}
        title={t.home.bestTitle}
        description={t.home.bestDesc}
        href="/tienda?sort=popular"
        linkLabel={t.home.bestLink}
        records={bestSellers}
      />

      <FeaturedArtists artists={artists} />

      <BlogPreview posts={posts} />
    </>
  );
}
