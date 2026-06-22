// Limitador de tasa simple en memoria (ventana deslizante).
// Nota: en serverless el estado es por instancia; suficiente para frenar abuso
// básico (fuerza bruta, spam). Para algo estricto, usar un store compartido.
const buckets = new Map<string, number[]>();

/** Devuelve true si la acción está permitida; false si se superó el límite. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  if (buckets.size > 5000) buckets.clear(); // evita crecimiento sin límite
  return true;
}

/** Extrae la IP del cliente de las cabeceras de proxy (las pone Vercel). */
export function ipFromRequest(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}
