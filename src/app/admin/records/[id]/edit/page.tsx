import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RecordForm, type RecordInitial } from "@/components/admin/record-form";
import {
  deleteRecordAction,
  updateRecordAction,
} from "@/app/admin/actions";
import {
  getArtistsBasic,
  getGenresBasic,
  getRecordForEdit,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EditRecordPage({
  params,
}: {
  params: { id: string };
}) {
  const [record, artists, genres] = await Promise.all([
    getRecordForEdit(params.id),
    getArtistsBasic(),
    getGenresBasic(),
  ]);

  if (!record) notFound();

  const initial: RecordInitial = {
    id: record.id,
    title: record.title,
    artistId: record.artistId,
    genreId: record.genreId,
    label: record.label,
    year: record.year,
    priceEuros: (record.priceCents / 100).toFixed(2),
    condition: record.condition,
    mediaGrade: record.mediaGrade ?? "",
    color: record.color ?? "",
    colorEn: record.colorEn ?? "",
    stock: record.stock,
    description: record.description,
    descriptionEn: record.descriptionEn ?? "",
    featured: record.featured,
    heroFeatured: record.heroFeatured,
    coverUrl: record.images[0]?.url ?? "",
    image2Url: record.images[1]?.url ?? "",
    vinylUrl: record.vinylImage ?? "",
    vinylSpin: record.vinylSpin,
    tracksText: record.tracks
      .map((t) => `${t.title}${t.duration ? ` | ${t.duration}` : ""}`)
      .join("\n"),
  };

  return (
    <div className="container max-w-4xl py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al panel
      </Link>
      <div className="mb-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Editar vinilo
        </h1>
        <form action={deleteRecordAction}>
          <input type="hidden" name="id" value={record.id} />
          <Button
            type="submit"
            variant="outline"
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 /> Eliminar
          </Button>
        </form>
      </div>
      <RecordForm
        action={updateRecordAction}
        artists={artists}
        genres={genres}
        initial={initial}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
