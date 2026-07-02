import { NextResponse } from "next/server";

import { getPostsForFeed } from "@/lib/queries";
import { SITE } from "@/lib/constants";
import { absoluteUrl, plainText, xmlEscape } from "@/lib/feed";

export const runtime = "nodejs";
export const revalidate = 3600;

/** RSS 2.0 del blog de Ocean Blvd Vinyl. */
export async function GET() {
  const posts = await getPostsForFeed();

  const items = posts
    .map((p) => {
      const link = absoluteUrl(`/blog/${p.slug}`);
      return (
        `<item>` +
        `<title>${xmlEscape(p.title)}</title>` +
        `<link>${xmlEscape(link)}</link>` +
        `<guid isPermaLink="true">${xmlEscape(link)}</guid>` +
        `<pubDate>${p.publishedAt.toUTCString()}</pubDate>` +
        `<description>${xmlEscape(plainText(p.excerpt, 500))}</description>` +
        (p.author ? `<author>${xmlEscape(p.author)}</author>` : "") +
        (p.tag ? `<category>${xmlEscape(p.tag)}</category>` : "") +
        `</item>`
      );
    })
    .join("");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<rss version="2.0">` +
    `<channel>` +
    `<title>${xmlEscape(`${SITE.name} — Blog`)}</title>` +
    `<link>${xmlEscape(absoluteUrl("/blog"))}</link>` +
    `<description>${xmlEscape("Cultura, lanzamientos y rarezas del mundo del vinilo.")}</description>` +
    `<language>es-ES</language>` +
    items +
    `</channel>` +
    `</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
