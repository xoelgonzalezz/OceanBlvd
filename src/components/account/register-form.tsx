"use client";

import { useFormState, useFormStatus } from "react-dom";

import { registerAction, type AuthState } from "@/app/(shop)/cuenta/actions";
import { useT } from "@/components/i18n/locale-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? t.account.creating : t.account.signUp}
    </Button>
  );
}

export function RegisterForm() {
  const t = useT();
  const [state, action] = useFormState(registerAction, {} as AuthState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="name">{t.account.name}</Label>
        <Input id="name" name="name" required autoFocus autoComplete="name" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="email">{t.account.email}</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="password">{t.account.password}</Label>
        <Input id="password" name="password" type="password" required autoComplete="new-password" minLength={6} className="mt-1.5" />
      </div>
      {state?.error ? (
        <p role="alert" className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
