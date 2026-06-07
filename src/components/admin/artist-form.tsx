"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/app/admin/actions";

export interface ArtistInitial {
  id: string;
  name: string;
  bio: string;
  bioEn: string;
  image: string;
  country: string;
  foundedYear: string;
  featured: boolean;
}

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

export function ArtistForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  initial?: ArtistInitial;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" defaultValue={initial?.name} required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="bio">Biografía (español)</Label>
        <Textarea id="bio" name="bio" defaultValue={initial?.bio} required rows={4} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="bioEn">Biografía (inglés, opcional)</Label>
        <Textarea id="bioEn" name="bioEn" defaultValue={initial?.bioEn} rows={4} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="image">URL de la foto (opcional)</Label>
        <Input id="image" name="image" defaultValue={initial?.image} placeholder="https://…/artista.jpg" className="mt-1.5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="country">País (opcional)</Label>
          <Input id="country" name="country" defaultValue={initial?.country} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="foundedYear">Año de inicio (opcional)</Label>
          <Input id="foundedYear" name="foundedYear" type="number" defaultValue={initial?.foundedYear} className="mt-1.5" />
        </div>
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
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
