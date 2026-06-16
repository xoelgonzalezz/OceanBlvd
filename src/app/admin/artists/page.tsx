import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAdminArtists } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Avisos tras borrar/archivar (?msg=...). */
const MESSAGES: Record<string, string> = {
  "artist-deleted": "Artista eliminado.",
  "artist-archived":
    "Este artista tenía discos vendidos, así que lo hemos archivado junto con sus discos: desaparecen de la tienda, pero se conserva el historial de pedidos.",
  "artist-error":
    "No se pudo eliminar el artista. Inténtalo de nuevo más tarde.",
};

export default async function AdminArtistsPage({
  searchParams,
}: {
  searchParams: { msg?: string };
}) {
  const artists = await getAdminArtists();
  const notice = searchParams.msg ? MESSAGES[searchParams.msg] : null;

  return (
    <div className="container py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al panel
      </Link>

      {notice && (
        <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          {notice}
        </div>
      )}

      <div className="mb-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Artistas
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {artists.length} artistas.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/artists/new">
            <Plus /> Nuevo artista
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {artists.map((a) => (
          <Link
            key={a.id}
            href={`/admin/artists/${a.id}/edit`}
            className="rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-card/70"
          >
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                <Image
                  src={a.image ?? "/placeholders/artist-01.svg"}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">
                  {a._count.records} discos
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
