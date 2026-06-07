import { Disc3 } from "lucide-react";
import type { Track } from "@prisma/client";

import { getDict } from "@/i18n/server";

export function Tracklist({ tracks }: { tracks: Track[] }) {
  const t = getDict();
  if (!tracks.length) return null;

  return (
    <div>
      <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-semibold">
        <Disc3 className="h-5 w-5 text-primary" />
        {t.detail.tracklist}
      </h2>
      <ol className="divide-y divide-border/60">
        {tracks.map((t) => (
          <li
            key={t.id}
            className="flex items-center gap-4 py-2.5 text-sm transition-colors hover:text-primary"
          >
            <span className="w-6 text-right tabular-nums text-muted-foreground">
              {t.position}
            </span>
            <span className="flex-1">{t.title}</span>
            {t.duration ? (
              <span className="tabular-nums text-muted-foreground">
                {t.duration}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
