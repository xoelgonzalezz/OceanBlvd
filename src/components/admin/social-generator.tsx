"use client";

import * as React from "react";
import { Loader2, Megaphone, Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

interface RecordOption {
  id: string;
  title: string;
  artist: string;
}
interface Post {
  hook: string;
  caption: string;
  hashtags: string[];
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export function SocialGenerator({ records }: { records: RecordOption[] }) {
  const [recordId, setRecordId] = React.useState(records[0]?.id ?? "");
  const [platform, setPlatform] = React.useState("both");
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [copied, setCopied] = React.useState<number | null>(null);

  async function onGenerate() {
    if (!recordId) {
      toast.error("Elige un disco.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId, platform }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "No se pudo generar.");
        return;
      }
      setPosts(data.posts ?? []);
    } catch {
      toast.error("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPost(post: Post, i: number) {
    const text = `${post.caption}\n\n${post.hashtags.join(" ")}`.trim();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("No se pudo copiar.");
    }
  }

  if (records.length === 0) {
    return (
      <p className="rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
        Aún no tienes discos en el catálogo. Añade alguno y vuelve para generar
        contenido.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-muted-foreground">
            Disco
          </label>
          <select
            value={recordId}
            onChange={(e) => setRecordId(e.target.value)}
            className={selectClass}
          >
            {records.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} — {r.artist}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:w-48">
          <label className="mb-1 block text-xs text-muted-foreground">
            Plataforma
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className={selectClass}
          >
            <option value="both">TikTok e Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
        <Button onClick={onGenerate} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generando…
            </>
          ) : (
            <>
              <Megaphone className="h-4 w-4" /> Generar ideas
            </>
          )}
        </Button>
      </div>

      {posts.length > 0 && (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {posts.map((p, i) => (
            <div key={i} className="flex flex-col rounded-lg border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                Gancho
              </p>
              <p className="mt-1 text-sm font-medium">{p.hook}</p>

              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Texto
              </p>
              <p className="mt-1 whitespace-pre-line text-sm">{p.caption}</p>

              {p.hashtags.length > 0 && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {p.hashtags.join(" ")}
                </p>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4 self-start"
                onClick={() => copyPost(p, i)}
              >
                {copied === i ? (
                  <>
                    <Check className="h-4 w-4" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copiar
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
