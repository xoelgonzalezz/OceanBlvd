"use client";

import { useFormState, useFormStatus } from "react-dom";

import {
  requestPasswordResetAction,
  type AuthState,
} from "@/app/(shop)/cuenta/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Enviando…" : "Enviar enlace de recuperación"}
    </Button>
  );
}

export function RequestResetForm() {
  const [state, action] = useFormState(
    requestPasswordResetAction,
    {} as AuthState
  );

  if (state?.success) {
    return (
      <p
        role="status"
        className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-foreground"
      >
        Si existe una cuenta con ese correo, te hemos enviado un enlace para
        restablecer la contraseña. Revisa tu bandeja de entrada (y la carpeta de
        spam). El enlace caduca en 30 minutos.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoFocus
          autoComplete="email"
          className="mt-1.5"
        />
      </div>
      {state?.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
