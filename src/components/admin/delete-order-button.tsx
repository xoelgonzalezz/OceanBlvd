"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Trash2, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { deleteOrderAction } from "@/app/admin/actions";

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={pending}
      className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Borrar definitivamente
    </Button>
  );
}

/**
 * Borrado de un pedido con re-autenticación: al pulsar «Eliminar» se despliega
 * un campo donde hay que volver a escribir la contraseña de admin. Sin esa
 * contraseña, el servidor no borra nada.
 */
export function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = React.useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
      >
        <Trash2 className="h-3.5 w-3.5" /> Eliminar pedido
      </button>
    );
  }

  return (
    <form
      action={deleteOrderAction}
      className="flex flex-wrap items-end gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3"
    >
      <input type="hidden" name="id" value={orderId} />
      <div className="min-w-[200px] flex-1">
        <label
          htmlFor={`del-pass-${orderId}`}
          className="mb-1 block text-xs text-muted-foreground"
        >
          Confirma con tu contraseña de admin para borrar este pedido
        </label>
        <Input
          id={`del-pass-${orderId}`}
          name="password"
          type="password"
          autoComplete="off"
          placeholder="Contraseña de admin"
          required
          autoFocus
        />
      </div>
      <ConfirmButton />
      <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
        Cancelar
      </Button>
    </form>
  );
}
