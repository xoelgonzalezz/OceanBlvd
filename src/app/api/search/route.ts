import { NextResponse } from "next/server";

import { searchRecords } from "@/lib/queries";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";

export async function GET(request: Request) {
  if (!rateLimit(`search:${ipFromRequest(request)}`, 60, 60_000)) {
    return NextResponse.json({ results: [] }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? "";

  if (!q.trim()) return NextResponse.json({ results: [] });

  const records = await searchRecords(q, 8);

  const results = records.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    artist: r.artist.name,
    priceCents: r.priceCents,
    image: r.images[0]?.url ?? "/placeholders/cover-01.svg",
  }));

  return NextResponse.json({ results });
}
