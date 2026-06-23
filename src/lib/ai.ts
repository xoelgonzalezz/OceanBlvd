// Integración con la API de Claude (Anthropic) para generar textos del admin.
// Se activa con ANTHROPIC_API_KEY. Sin clave, las funciones devuelven null y la
// app sigue funcionando con normalidad.

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
// Modelo por defecto: Sonnet 4.6 (buena prosa, equilibrado). Se puede cambiar
// con la variable AI_MODEL (p. ej. "claude-haiku-4-5-20251001" para abaratar).
const AI_MODEL = process.env.AI_MODEL || "claude-sonnet-4-6";

export const aiEnabled = Boolean(ANTHROPIC_API_KEY);

export interface RecordDescInput {
  artist: string;
  title: string;
  year?: number;
  genre?: string;
  condition?: string; // "NEW" | "USED"
  grade?: string; // "M", "NM"...
  color?: string;
}

export interface RecordDesc {
  es: string;
  en: string;
}

/** Llama a la API de Claude (Messages). Devuelve el texto o null si falla. */
async function callClaude(prompt: string, maxTokens: number): Promise<string | null> {
  if (!ANTHROPIC_API_KEY) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    return data.content?.find((c) => c.type === "text")?.text ?? null;
  } catch {
    return null;
  }
}

/** Genera la descripción (ES + EN) de venta de un disco. */
export async function generateRecordDescription(
  input: RecordDescInput
): Promise<RecordDesc | null> {
  const conditionLabel =
    input.condition === "NEW" ? "nuevo, precintado" : "segunda mano";

  const prompt = `Eres el redactor de Ocean Blvd Vinyl, una tienda online española de vinilos con un tono cercano y experto.

Escribe una descripción de venta para este disco:
- Artista: ${input.artist}
- Álbum: ${input.title}
${input.year ? `- Año: ${input.year}\n` : ""}${input.genre ? `- Género: ${input.genre}\n` : ""}- Estado: ${conditionLabel}${input.grade ? ` (grado ${input.grade})` : ""}${input.color ? `\n- Color del vinilo: ${input.color}` : ""}

Requisitos:
- 2 o 3 frases, atractivas y naturales. NO inventes datos de ediciones, prensajes o sellos que no se te hayan dado.
- Explica por qué merece la pena y apela a la experiencia de escucharlo en vinilo.
- Buena para SEO: incluye el artista y el álbum de forma natural.

Devuelve SOLO un objeto JSON válido, sin texto adicional ni markdown, con esta forma exacta:
{"es": "<descripción en español>", "en": "<la misma descripción traducida al inglés>"}`;

  const text = await callClaude(prompt, 700);
  if (!text) return null;

  // Extrae el JSON aunque venga con texto alrededor.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]) as { es?: unknown; en?: unknown };
    if (typeof parsed.es !== "string" || !parsed.es.trim()) return null;
    return {
      es: parsed.es.trim(),
      en: typeof parsed.en === "string" ? parsed.en.trim() : "",
    };
  } catch {
    return null;
  }
}

export interface CatalogIdea {
  artist: string;
  title: string;
  year?: number;
  genre?: string;
  reason: string;
}

/**
 * Sugiere discos a stockear relacionados con una "semilla" (género, artista,
 * vibe...). Devuelve una lista de ideas, o null si falla.
 */
export async function suggestCatalog(
  seed: string,
  count = 12
): Promise<CatalogIdea[] | null> {
  const prompt = `Eres un comprador experto para Ocean Blvd Vinyl, una tienda de vinilos en España.

Propón ${count} discos en VINILO que merezca la pena tener en stock, relacionados con: "${seed}".
Mezcla clásicos atemporales y novedades populares que se vendan bien. Evita rarezas casi imposibles de conseguir.

Devuelve SOLO un array JSON válido, sin texto adicional ni markdown, con objetos de esta forma exacta:
[{"artist":"...","title":"...","year":1990,"genre":"...","reason":"motivo breve de por qué se vende bien"}]`;

  const text = await callClaude(prompt, 2000);
  if (!text) return null;

  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]) as unknown;
    if (!Array.isArray(arr)) return null;
    return arr
      .map((x) => {
        const o = (x ?? {}) as Record<string, unknown>;
        return {
          artist: String(o.artist ?? "").slice(0, 200),
          title: String(o.title ?? "").slice(0, 200),
          year: Number(o.year) || undefined,
          genre: o.genre ? String(o.genre).slice(0, 100) : undefined,
          reason: String(o.reason ?? "").slice(0, 400),
        };
      })
      .filter((x) => x.artist && x.title)
      .slice(0, count);
  } catch {
    return null;
  }
}

export interface SocialPost {
  hook: string;
  caption: string;
  hashtags: string[];
}

/** Genera ideas de publicación para redes a partir de un disco del catálogo. */
export async function generateSocialPosts(input: {
  artist: string;
  title: string;
  year?: number;
  genre?: string;
  condition?: string;
  platform: string; // "TikTok" | "Instagram" | "TikTok e Instagram"
}): Promise<SocialPost[] | null> {
  const cond = input.condition === "NEW" ? "nuevo/precintado" : "segunda mano";
  const prompt = `Eres el community manager de Ocean Blvd Vinyl, una tienda de vinilos en España. Tono cercano, joven y natural (español de España).

Crea 3 ideas de publicación para ${input.platform} sobre este disco en VINILO:
- Artista: ${input.artist}
- Álbum: ${input.title}
${input.year ? `- Año: ${input.year}\n` : ""}${input.genre ? `- Género: ${input.genre}\n` : ""}- Estado: ${cond}

Cada idea debe tener:
- "hook": gancho corto para los primeros segundos del vídeo o la primera línea (que pare el scroll).
- "caption": texto de la publicación (1-3 frases, con algún emoji y una llamada a la acción sutil para comprar/visitar la tienda). No inventes datos de ediciones.
- "hashtags": entre 6 y 8 hashtags relevantes (vinilo, el artista, el género, comunidad de coleccionistas...), cada uno empezando por "#".

Devuelve SOLO un array JSON válido, sin texto adicional ni markdown:
[{"hook":"...","caption":"...","hashtags":["#vinilo","#..."]}]`;

  const text = await callClaude(prompt, 1500);
  if (!text) return null;
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    const arr = JSON.parse(match[0]) as unknown;
    if (!Array.isArray(arr)) return null;
    return arr
      .map((x) => {
        const o = (x ?? {}) as Record<string, unknown>;
        return {
          hook: String(o.hook ?? "").slice(0, 300),
          caption: String(o.caption ?? "").slice(0, 1000),
          hashtags: Array.isArray(o.hashtags)
            ? o.hashtags.map((h) => String(h)).filter(Boolean).slice(0, 12)
            : [],
        };
      })
      .filter((x) => x.caption)
      .slice(0, 4);
  } catch {
    return null;
  }
}
