import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { rateLimit, ipFromRequest } from "@/lib/rate-limit";

// Node runtime: el cliente Prisma no corre en el edge.
export const runtime = "nodejs";

/**
 * Registra una visita (una por sesión, enviada al entrar). Analítica propia y
 * anónima: guardamos la ruta de entrada, la fecha y la ciudad/país estimados por
 * IP a partir de las cabeceras de geolocalización de Vercel. Nunca guardamos la
 * IP ni datos personales.
 */
// Dominios conocidos → nombre de canal bonito.
const SOURCE_MAP: { match: string; name: string }[] = [
  { match: "tiktok", name: "TikTok" },
  { match: "instagram", name: "Instagram" },
  { match: "facebook", name: "Facebook" },
  { match: "youtube", name: "YouTube" },
  { match: "google", name: "Google" },
  { match: "bing", name: "Bing" },
  { match: "duckduckgo", name: "DuckDuckGo" },
  { match: "reddit", name: "Reddit" },
  { match: "twitter", name: "Twitter/X" },
  { match: "t.co", name: "Twitter/X" },
  { match: "x.com", name: "Twitter/X" },
  { match: "t.me", name: "Telegram" },
  { match: "whatsapp", name: "WhatsApp" },
  { match: "discogs", name: "Discogs" },
];

/** Normaliza un nombre de utm_source a un canal bonito si lo reconocemos. */
function nameFromKeyword(value: string): string {
  const v = value.toLowerCase();
  for (const s of SOURCE_MAP) if (v.includes(s.match)) return s.name;
  // Capitaliza la primera letra como respaldo.
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Deriva el canal de origen a partir del referrer y los parámetros UTM. */
function deriveSource(
  referrerHost: string | null,
  utmSource: string | null,
  ownHost: string | null
): string {
  if (utmSource) return nameFromKeyword(utmSource);
  if (!referrerHost) return "Directo";
  if (ownHost && referrerHost === ownHost) return "Directo";
  for (const s of SOURCE_MAP) if (referrerHost.includes(s.match)) return s.name;
  return referrerHost.replace(/^www\./, "");
}

export async function POST(req: Request) {
  // Analítica: si se supera el límite, descartamos en silencio (204).
  if (!rateLimit(`track:${ipFromRequest(req)}`, 60, 60_000)) {
    return new NextResponse(null, { status: 204 });
  }
  try {
    const body = (await req.json()) as {
      path?: unknown;
      referrer?: unknown;
      query?: unknown;
    };
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

      // Origen del tráfico: dominio del referrer + utm_source si viene.
      let referrerHost: string | null = null;
      if (typeof body.referrer === "string" && body.referrer) {
        try {
          referrerHost = new URL(body.referrer).hostname || null;
        } catch {
          referrerHost = null;
        }
      }
      let utmSource: string | null = null;
      if (typeof body.query === "string" && body.query) {
        try {
          utmSource = new URLSearchParams(body.query).get("utm_source");
        } catch {
          utmSource = null;
        }
      }
      const source = deriveSource(
        referrerHost,
        utmSource,
        req.headers.get("host")
      );

      await db.pageView.create({
        data: { path, city, country, referrer: referrerHost, source },
      });
    }
  } catch {
    // Nunca rompemos la navegación del usuario por un fallo de analítica.
  }

  // 204: sin contenido. sendBeacon ignora la respuesta de todos modos.
  return new NextResponse(null, { status: 204 });
}
