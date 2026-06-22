"use client";

import { useFormState, useFormStatus } from "react-dom";

import {
  resetPasswordAction,
  type AuthState,
} from "@/app/(shop)/cuenta/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Guardando…" : "Guardar nueva contraseña"}
    </Button>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action] = useFormState(resetPasswordAction, {} as AuthState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">Nueva contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          minLength={6}
          autoComplete="new-password"
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Mínimo 6 caracteres.
        </p>
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
