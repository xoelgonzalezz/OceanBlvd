import { NextResponse } from "next/server";

import { getCatalogForFeed } from "@/lib/queries";
import { csvCell } from "@/lib/csv";
import {
  feedCondition,
  feedPrice,
  metaAvailability,
  plainText,
  productImage,
  productLink,
} from "@/lib/feed";

export const runtime = "nodejs";
export const revalidate = 3600;

/**
 * Feed de catálogo de Meta (CSV) para etiquetar productos en Instagram/Facebook.
 * Columnas según la especificación del catálogo de Meta.
 */
export async function GET() {
  const records = await getCatalogForFeed();

  const header = [
    "id",
    "title",
    "description",
    "availability",
    "condition",
    "price",
    "link",
    "image_link",
    "brand",
  ];
  const lines = [header.join(",")];

  for (const r of records) {
    lines.push(
      [
        csvCell(r.id),
        csvCell(plainText(`${r.artist.name} – ${r.title} (Vinilo)`, 150)),
        csvCell(plainText(r.description, 5000)),
        csvCell(metaAvailability(r.stock)),
        csvCell(feedCondition(r.condition)),
        csvCell(feedPrice(r.priceCents)),
        csvCell(productLink(r.slug)),
        csvCell(productImage(r)),
        csvCell(r.artist.name),
      ].join(",")
    );
  }

  const csv = "﻿" + lines.join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
