import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ArtistForm } from "@/components/admin/artist-form";

export const dynamic = "force-dynamic";

export default function NewArtistPage() {
  return (
    <div className="container max-w-2xl py-10">
      <Link
        href="/admin/artists"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver a artistas
      </Link>
      <h1 className="mb-8 mt-4 font-serif text-3xl font-semibold tracking-tight">
        Nuevo artista
      </h1>
      <ArtistForm />
    </div>
  );
}
