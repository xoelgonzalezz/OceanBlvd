// Búsqueda de portada real por artista + título (iTunes con fallback a Deezer).
// Se usa tanto en el seed como en el panel de administración.

function norm(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function score(
  artist: string,
  album: string,
  r: { artistName?: string; collectionName?: string }
): number {
  const an = norm(r.artistName || "");
  const cn = norm(r.collectionName || "");
  const aWanted = norm(artist);
  const albWanted = norm(album);
  let s = 0;
  if (an.includes(aWanted) || aWanted.includes(an)) s += 3;
  else return -10;
  const albWords = albWanted.split(" ").filter((w) => w.length > 2);
  const matched = albWords.filter((w) => cn.includes(w)).length;
  s += albWords.length ? (matched / albWords.length) * 4 : 0;
  if (/\b(karaoke|tribute|made famous|instrumental)\b/.test(cn)) s -= 6;
  return s;
}

export async function findCover(
  artist: string,
  title: string
): Promise<string | null> {
  // 1) iTunes Search API
  try {
    const term = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${term}&entity=album&limit=20&country=US`
    );
    if (res.ok) {
      const json = await res.json();
      let best: { artworkUrl100?: string } | null = null;
      let bestScore = 1.5;
      for (const r of json.results || []) {
        const sc = score(artist, title, r);
        if (sc > bestScore) {
          bestScore = sc;
          best = r;
        }
      }
      if (best?.artworkUrl100) {
        return best.artworkUrl100.replace("100x100bb", "600x600bb");
      }
    }
  } catch {
    /* probamos Deezer */
  }

  // 2) Deezer (fallback)
  try {
    const res = await fetch(
      `https://api.deezer.com/search/album?q=${encodeURIComponent(
        `${artist} ${title}`
      )}&limit=10`
    );
    if (res.ok) {
      const json = await res.json();
      const wanted = norm(artist).split(" ")[0];
      for (const r of json.data || []) {
        if (norm(r.artist?.name || "").includes(wanted) && r.cover_xl) {
          return r.cover_xl;
        }
      }
      const first = (json.data || [])[0];
      if (first?.cover_xl) return first.cover_xl;
    }
  } catch {
    /* nada */
  }

  return null;
}
