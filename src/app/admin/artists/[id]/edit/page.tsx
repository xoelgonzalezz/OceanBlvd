import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ArtistForm, type ArtistInitial } from "@/components/admin/artist-form";
import { deleteArtistAction, updateArtistAction } from "@/app/admin/actions";
import { getArtistForEdit } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditArtistPage({
  params,
}: {
  params: { id: string };
}) {
  const artist = await getArtistForEdit(params.id);
  if (!artist) notFound();

  const initial: ArtistInitial = {
    id: artist.id,
    name: artist.name,
    bio: artist.bio,
    bioEn: artist.bioEn ?? "",
    image: artist.image ?? "",
    country: artist.country ?? "",
    foundedYear: artist.foundedYear != null ? String(artist.foundedYear) : "",
    featured: artist.featured,
  };

  return (
    <div className="container max-w-2xl py-10">
      <Link
        href="/admin/artists"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver a artistas
      </Link>
      <div className="mb-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Editar artista
        </h1>
        <form action={deleteArtistAction}>
          <input type="hidden" name="id" value={artist.id} />
          <Button
            type="submit"
            variant="outline"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 /> Eliminar
          </Button>
        </form>
      </div>
      <ArtistForm
        action={updateArtistAction}
        initial={initial}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
