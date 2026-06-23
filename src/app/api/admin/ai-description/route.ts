import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-token";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";
import { generateRecordDescription, aiEnabled } from "@/lib/ai";

export const runtime = "nodejs";

/** Genera una descripción de disco (ES + EN) con IA para el formulario de admin. */
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
  if (!rateLimit(`ai-desc:${ipFromRequest(request)}`, 20, 60_000)) {
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

  const result = await generateRecordDescription({
    artist,
    title,
    year: Number(body.year) || undefined,
    genre: body.genre ? String(body.genre).slice(0, 100) : undefined,
    condition: body.condition ? String(body.condition).slice(0, 20) : undefined,
    grade: body.grade ? String(body.grade).slice(0, 10) : undefined,
    color: body.color ? String(body.color).slice(0, 60) : undefined,
  });

  if (!result) {
    return NextResponse.json(
      { error: "No se pudo generar la descripción. Inténtalo de nuevo." },
      { status: 502 }
    );
  }

  return NextResponse.json(result);
}
