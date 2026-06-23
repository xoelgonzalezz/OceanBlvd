import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-token";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";
import { getReleaseTracklist, discogsEnabled } from "@/lib/discogs";

export const runtime = "nodejs";

/** Devuelve el tracklist real (con duraciones) de un disco desde Discogs. */
export async function POST(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  if (!discogsEnabled) {
    return NextResponse.json(
      { error: "Discogs no está configurado (faltan las claves)." },
      { status: 503 }
    );
  }
  if (!rateLimit(`discogs-tracks:${ipFromRequest(request)}`, 30, 60_000)) {
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

  const artist = String(body.artist ?? "").trim().slice(0, 200);
  const title = String(body.title ?? "").trim().slice(0, 200);
  if (!artist || !title) {
    return NextResponse.json(
      { error: "Selecciona un artista y escribe el título." },
      { status: 400 }
    );
  }

  const tracks = await getReleaseTracklist(artist, title);
  if (!tracks) {
    return NextResponse.json(
      { error: "No se encontró el tracklist en Discogs para este disco." },
      { status: 404 }
    );
  }

  return NextResponse.json({ tracks });
}
