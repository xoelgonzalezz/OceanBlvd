import { NextResponse } from "next/server";

import { db } from "@/lib/db";

// Node runtime: el cliente Prisma no corre en el edge.
export const runtime = "nodejs";

/**
 * Registra una visita a una página pública. Analítica propia y anónima:
 * solo se guarda la ruta (sin query) y la fecha, nunca cookies, IP ni datos
 * personales. Pensado para llamarse vía `navigator.sendBeacon` desde el cliente.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { path?: unknown };
    let path = typeof body.path === "string" ? body.path.trim() : "";

    // Quitamos query/hash y validamos que sea una ruta interna razonable.
    path = path.split(/[?#]/)[0];
    const valid =
      path.startsWith("/") &&
      path.length <= 512 &&
      !path.startsWith("/admin") &&
      !path.startsWith("/api") &&
      !path.startsWith("/_next");

    if (valid) {
      await db.pageView.create({ data: { path } });
    }
  } catch {
    // Nunca rompemos la navegación del usuario por un fallo de analítica.
  }

  // 204: sin contenido. sendBeacon ignora la respuesta de todos modos.
  return new NextResponse(null, { status: 204 });
}
