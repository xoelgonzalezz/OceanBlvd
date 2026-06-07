"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createArtistAction, type ActionState } from "@/app/admin/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Guardando…
        </>
      ) : (
        "Crear artista"
      )}
    </Button>
  );
}

export function ArtistForm() {
  const [state, action] = useFormState(createArtistAction, {} as ActionState);

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="bio">Biografía</Label>
        <Textarea id="bio" name="bio" required rows={4} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="image">URL de la foto (opcional)</Label>
        <Input id="image" name="image" placeholder="https://…/artista.jpg" className="mt-1.5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="country">País (opcional)</Label>
          <Input id="country" name="country" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="foundedYear">Año de inicio (opcional)</Label>
          <Input id="foundedYear" name="foundedYear" type="number" className="mt-1.5" />
        </div>
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" name="featured" className="h-4 w-4 accent-foreground" />
        Destacar en la página de inicio
      </label>

      {state?.error ? (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}
