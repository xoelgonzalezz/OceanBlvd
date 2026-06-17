"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { ImageIcon, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  searchCoverAction,
  type ActionState,
} from "@/app/admin/actions";

interface Option {
  id: string;
  name: string;
}

export interface RecordInitial {
  id: string;
  title: string;
  artistId: string;
  genreId: string;
  label: string;
  year: number;
  priceEuros: string;
  condition: string;
  mediaGrade: string;
  color: string;
  colorEn: string;
  stock: number;
  description: string;
  descriptionEn: string;
  featured: boolean;
  coverUrl: string;
  tracksText: string;
}

const selectClass =
  "mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-sm";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Guardando…
        </>
      ) : (
        label
      )}
    </Button>
  );
}

export function RecordForm({
  action,
  artists,
  genres,
  initial,
  submitLabel,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  artists: Option[];
  genres: Option[];
  initial?: RecordInitial;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);

  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [artistId, setArtistId] = React.useState(initial?.artistId ?? "");
  const [coverUrl, setCoverUrl] = React.useState(initial?.coverUrl ?? "");
  const [searching, setSearching] = React.useState(false);

  async function handleSearchCover() {
    const artistName = artists.find((a) => a.id === artistId)?.name;
    if (!artistName || !title.trim()) {
      toast.error("Selecciona un artista y escribe el título primero.");
      return;
    }
    setSearching(true);
    try {
      const url = await searchCoverAction(artistName, title);
      if (url) {
        setCoverUrl(url);
        toast.success("Portada encontrada.");
      } else {
        toast.error("No se encontró portada. Pega una URL manualmente.");
      }
    } finally {
      setSearching(false);
    }
  }

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1fr_300px]">
      <div className="order-2 space-y-5 lg:order-1">
        {initial ? <input type="hidden" name="id" value={initial.id} /> : null}

        <div>
          <Label htmlFor="title">Título del álbum</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1.5"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="artistId">Artista</Label>
            <select
              id="artistId"
              name="artistId"
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              required
              className={selectClass}
            >
              <option value="">Selecciona…</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="genreId">Género</Label>
            <select
              id="genreId"
              name="genreId"
              defaultValue={initial?.genreId ?? ""}
              required
              className={selectClass}
            >
              <option value="">Selecciona…</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="label">Sello discográfico</Label>
            <Input id="label" name="label" defaultValue={initial?.label} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="year">Año</Label>
            <Input id="year" name="year" type="number" defaultValue={initial?.year} required className="mt-1.5" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">Precio (€)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={initial?.priceEuros}
              required
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" name="stock" type="number" min="0" defaultValue={initial?.stock ?? 1} className="mt-1.5" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="condition">Estado</Label>
            <select id="condition" name="condition" defaultValue={initial?.condition ?? "USED"} className={selectClass}>
              <option value="NEW">Nuevo</option>
              <option value="USED">Segunda mano</option>
            </select>
          </div>
          <div>
            <Label htmlFor="mediaGrade">Calidad del disco</Label>
            <select id="mediaGrade" name="mediaGrade" defaultValue={initial?.mediaGrade ?? ""} className={selectClass}>
              <option value="">—</option>
              <option value="M">Mint (M)</option>
              <option value="NM">Near Mint (NM)</option>
              <option value="VG+">Very Good Plus (VG+)</option>
              <option value="VG">Very Good (VG)</option>
              <option value="G+">Good Plus (G+)</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="color">Color del vinilo (español)</Label>
            <Input
              id="color"
              name="color"
              defaultValue={initial?.color}
              placeholder="p. ej. Negro, Transparente, Rojo…"
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="colorEn">Color del vinilo (inglés, opcional)</Label>
            <Input
              id="colorEn"
              name="colorEn"
              defaultValue={initial?.colorEn}
              placeholder="e.g. Black, Translucent, Red…"
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descripción (español)</Label>
          <Textarea id="description" name="description" defaultValue={initial?.description} required rows={4} className="mt-1.5" />
        </div>

        <div>
          <Label htmlFor="descriptionEn">Descripción (inglés, opcional)</Label>
          <Textarea id="descriptionEn" name="descriptionEn" defaultValue={initial?.descriptionEn} rows={4} className="mt-1.5" />
        </div>

        <div>
          <Label htmlFor="tracks">Tracklist (una pista por línea: «Título | 3:45»)</Label>
          <Textarea
            id="tracks"
            name="tracks"
            defaultValue={initial?.tracksText}
            rows={6}
            placeholder={"Speak to Me | 1:30\nBreathe (In the Air) | 2:43"}
            className="mt-1.5 font-mono text-xs"
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={initial?.featured}
            className="h-4 w-4 accent-foreground"
          />
          Destacar en la página de inicio
        </label>

        {state?.error ? (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {state.error}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <SubmitButton label={submitLabel} />
        </div>
      </div>

      {/* Portada */}
      <aside className="order-1 space-y-3 lg:order-2">
        <Label htmlFor="coverUrl">Portada</Label>
        <div
          className={cn(
            "relative flex aspect-square items-center justify-center overflow-hidden rounded-md border bg-muted"
          )}
        >
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="Vista previa de la portada" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          )}
        </div>
        <Input
          id="coverUrl"
          name="coverUrl"
          value={coverUrl}
          onChange={(e) => setCoverUrl(e.target.value)}
          placeholder="https://…/portada.jpg"
        />
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleSearchCover}
          disabled={searching}
        >
          {searching ? (
            <>
              <Loader2 className="animate-spin" /> Buscando…
            </>
          ) : (
            <>
              <Search /> Buscar portada real
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Pega una URL de imagen o búscala automáticamente por artista y título.
        </p>
      </aside>
    </form>
  );
}
