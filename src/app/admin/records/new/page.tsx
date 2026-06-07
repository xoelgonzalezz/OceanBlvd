import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { RecordForm } from "@/components/admin/record-form";
import { createRecordAction } from "@/app/admin/actions";
import { getArtistsBasic, getGenresBasic } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function NewRecordPage() {
  const [artists, genres] = await Promise.all([
    getArtistsBasic(),
    getGenresBasic(),
  ]);

  return (
    <div className="container max-w-4xl py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al panel
      </Link>
      <h1 className="mb-8 mt-4 font-serif text-3xl font-semibold tracking-tight">
        Nuevo vinilo
      </h1>
      <RecordForm
        action={createRecordAction}
        artists={artists}
        genres={genres}
        submitLabel="Crear vinilo"
      />
    </div>
  );
}
