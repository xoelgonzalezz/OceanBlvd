import { NextResponse } from "next/server";

import { db } from "@/lib/db";

// Node runtime: el cliente Prisma no corre en el edge.
export const runtime = "nodejs";

/**
 * Registra una visita (una por sesión, enviada al entrar). Analítica propia y
 * anónima: guardamos la ruta de entrada, la fecha y la ciudad/país estimados por
 * IP a partir de las cabeceras de geolocalización de Vercel. Nunca guardamos la
 * IP ni datos personales.
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
      // Geolocalización aproximada por IP (la pone Vercel en producción; en
      // local no llega y se guarda como null). La ciudad viene URL-encoded.
      const rawCity = req.headers.get("x-vercel-ip-city");
      let city: string | null = null;
      if (rawCity) {
        try {
          city = decodeURIComponent(rawCity);
        } catch {
          city = rawCity;
        }
      }
      const country = req.headers.get("x-vercel-ip-country") || null;

      await db.pageView.create({ data: { path, city, country } });
    }
  } catch {
    // Nunca rompemos la navegación del usuario por un fallo de analítica.
  }

  // 204: sin contenido. sendBeacon ignora la respuesta de todos modos.
  return new NextResponse(null, { status: 204 });
}
