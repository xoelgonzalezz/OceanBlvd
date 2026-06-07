"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/app/admin/actions";

const TAGS = [
  "Lanzamientos",
  "Ediciones especiales",
  "Cultura",
  "Guías",
  "Eventos",
  "Artistas",
];

const selectClass =
  "mt-1.5 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-sm";

export interface BlogInitial {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tag: string;
  coverImage: string;
  excerptEn: string;
  contentEn: string;
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

export function BlogForm({
  action,
  initial,
  submitLabel,
}: {
  action: (prev: ActionState, fd: FormData) => Promise<ActionState>;
  initial?: BlogInitial;
  submitLabel: string;
}) {
  const [state, formAction] = useFormState(action, {} as ActionState);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      {initial ? <input type="hidden" name="id" value={initial.id} /> : null}
      <div>
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" defaultValue={initial?.title} required className="mt-1.5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="author">Autor</Label>
          <Input id="author" name="author" defaultValue={initial?.author} required className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="tag">Categoría</Label>
          <select id="tag" name="tag" defaultValue={initial?.tag ?? ""} className={selectClass}>
            <option value="">—</option>
            {TAGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="coverImage">URL de la imagen de portada (opcional)</Label>
        <Input id="coverImage" name="coverImage" defaultValue={initial?.coverImage} placeholder="https://…/foto.jpg" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="excerpt">Extracto (español)</Label>
        <Textarea id="excerpt" name="excerpt" defaultValue={initial?.excerpt} required rows={2} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="content">Contenido (español, párrafos separados por línea en blanco)</Label>
        <Textarea id="content" name="content" defaultValue={initial?.content} required rows={10} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="excerptEn">Extracto (inglés, opcional)</Label>
        <Textarea id="excerptEn" name="excerptEn" defaultValue={initial?.excerptEn} rows={2} className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="contentEn">Contenido (inglés, opcional)</Label>
        <Textarea id="contentEn" name="contentEn" defaultValue={initial?.contentEn} rows={10} className="mt-1.5" />
      </div>

      {state?.error ? (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <SubmitButton label={submitLabel} />
    </form>
  );
}
