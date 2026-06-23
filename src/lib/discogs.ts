// Cliente mínimo de la API de Discogs (autenticación con Consumer Key/Secret,
// sin flujo OAuth de usuario). Se activa con DISCOGS_CONSUMER_KEY/SECRET.
// Sin claves, las funciones devuelven null y la app sigue funcionando.

const KEY = process.env.DISCOGS_CONSUMER_KEY;
const SECRET = process.env.DISCOGS_CONSUMER_SECRET;
const USER_AGENT = "OceanBlvdVinyl/1.0 +https://oceanblvdvinyl.com";

export const discogsEnabled = Boolean(KEY && SECRET);

async function discogsGet<T>(path: string): Promise<T | null> {
  if (!KEY || !SECRET) return null;
  try {
    const res = await fetch(`https://api.discogs.com${path}`, {
      headers: {
        Authorization: `Discogs key=${KEY}, secret=${SECRET}`,
        "User-Agent": USER_AGENT,
        Accept: "application/json",
      },
      // La analítica de catálogo no necesita datos al segundo.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export interface DiscogsMarket {
  releaseId: number;
  year: number | null;
  genre: string | null;
  thumb: string | null;
  url: string | null;
  lowestPriceEur: number | null;
  numForSale: number | null;
}

interface SearchResponse {
  results?: {
    id?: number;
    year?: string | number;
    genre?: string[];
    thumb?: string;
    cover_image?: string;
    uri?: string;
  }[];
}

interface StatsResponse {
  lowest_price?: { value?: number; currency?: string } | null;
  num_for_sale?: number;
}

/**
 * Busca una referencia en Discogs por artista + título y devuelve sus datos de
 * mercado (precio más bajo en venta y nº de copias a la venta). Devuelve null
 * si no hay coincidencia o si Discogs no está configurado/falla.
 */
export async function lookupRelease(
  artist: string,
  title: string
): Promise<DiscogsMarket | null> {
  const params = new URLSearchParams({
    type: "release",
    artist,
    release_title: title,
    per_page: "1",
  });
  const search = await discogsGet<SearchResponse>(
    `/database/search?${params.toString()}`
  );
  const first = search?.results?.[0];
  if (!first?.id) return null;

  const releaseId = Number(first.id);
  const stats = await discogsGet<StatsResponse>(
    `/marketplace/stats/${releaseId}?curr_abbr=EUR`
  );

  const year =
    typeof first.year === "number"
      ? first.year
      : parseInt(String(first.year ?? ""), 10) || null;

  return {
    releaseId,
    year,
    genre: Array.isArray(first.genre) ? first.genre[0] ?? null : null,
    thumb: first.thumb || first.cover_image || null,
    url: first.uri
      ? `https://www.discogs.com${first.uri}`
      : `https://www.discogs.com/release/${releaseId}`,
    lowestPriceEur:
      typeof stats?.lowest_price?.value === "number"
        ? stats.lowest_price.value
        : null,
    numForSale:
      typeof stats?.num_for_sale === "number" ? stats.num_for_sale : null,
  };
}
