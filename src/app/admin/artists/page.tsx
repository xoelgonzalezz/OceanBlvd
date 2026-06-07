import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAdminArtists } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function AdminArtistsPage() {
  const artists = await getAdminArtists();

  return (
    <div className="container py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al panel
      </Link>

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
          <div key={a.id} className="rounded-lg border bg-card p-4">
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
          </div>
        ))}
      </div>
    </div>
  );
}
