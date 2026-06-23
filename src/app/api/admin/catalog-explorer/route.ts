import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-token";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";
import { suggestCatalog, aiEnabled } from "@/lib/ai";
import { lookupRelease, discogsEnabled, type DiscogsMarket } from "@/lib/discogs";

export const runtime = "nodejs";
// La IA + varias llamadas a Discogs pueden tardar.
export const maxDuration = 60;

export interface ExplorerRow {
  artist: string;
  title: string;
  year?: number;
  genre?: string;
  reason: string;
  market: DiscogsMarket | null;
}

/** Explora ideas de catálogo: la IA propone y Discogs aporta precios reales. */
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
  // Es una operación cara (IA + Discogs): límite estricto.
  if (!rateLimit(`ai-explore:${ipFromRequest(request)}`, 6, 60_000)) {
    return NextResponse.json(
      { error: "Demasiadas búsquedas seguidas. Espera un minuto." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Petición no válida." }, { status: 400 });
  }

  const seed = String(body.seed ?? "").trim().slice(0, 200);
  if (!seed) {
    return NextResponse.json(
      { error: "Escribe un género, artista o estilo para explorar." },
      { status: 400 }
    );
  }

  const ideas = await suggestCatalog(seed, 12);
  if (!ideas || ideas.length === 0) {
    return NextResponse.json(
      { error: "No se pudieron generar ideas. Inténtalo de nuevo." },
      { status: 502 }
    );
  }

  // Enriquecemos con datos de mercado de Discogs (secuencial, respeta su límite).
  const rows: ExplorerRow[] = [];
  for (const idea of ideas) {
    const market = discogsEnabled
      ? await lookupRelease(idea.artist, idea.title)
      : null;
    rows.push({ ...idea, market });
  }

  return NextResponse.json({ rows, discogs: discogsEnabled });
}
