import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-token";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";
import { generateSocialPosts, aiEnabled } from "@/lib/ai";

export const runtime = "nodejs";

const PLATFORMS: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  both: "TikTok e Instagram",
};

/** Genera ideas de post para redes a partir de un disco del catálogo. */
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!aiEnabled) {
    return NextResponse.json(
      { error: "La IA no está configurada (falta ANTHROPIC_API_KEY)." },
      { status: 503 }
    );
  }
  if (!rateLimit(`social:${ipFromRequest(request)}`, 20, 60_000)) {
    return NextResponse.json(
      { error: "Demasiadas peticiones. Espera un momento." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }

  const recordId = String(body.recordId ?? "").trim();
  const platform = PLATFORMS[String(body.platform ?? "both")] ?? PLATFORMS.both;
  if (!recordId) {
    return NextResponse.json(
      { error: "Elige un disco de tu catálogo." },
      { status: 400 }
    );
  }

  const record = await db.record.findFirst({
    where: { id: recordId, archived: false },
    select: {
      title: true,
      year: true,
      condition: true,
      artist: { select: { name: true } },
      genre: { select: { name: true } },
    },
  });
  if (!record) {
    return NextResponse.json({ error: "Disco no encontrado." }, { status: 404 });
  }

  const posts = await generateSocialPosts({
    artist: record.artist.name,
    title: record.title,
    year: record.year,
    genre: record.genre?.name,
    condition: record.condition,
    platform,
  });

  if (!posts || posts.length === 0) {
    return NextResponse.json(
      { error: "No se pudieron generar ideas. Inténtalo de nuevo." },
      { status: 502 }
    );
  }

  return NextResponse.json({ posts });
}
