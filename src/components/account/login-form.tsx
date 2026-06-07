"use client";

import { useFormState, useFormStatus } from "react-dom";

import { loginAction, type AuthState } from "@/app/(shop)/cuenta/actions";
import { useT } from "@/components/i18n/locale-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? t.account.signingIn : t.account.signIn}
    </Button>
  );
}

export function LoginForm() {
  const t = useT();
  const [state, action] = useFormState(loginAction, {} as AuthState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">{t.account.email}</Label>
        <Input id="email" name="email" type="email" required autoFocus autoComplete="email" className="mt-1.5" />
      </div>
      <div>
        <Label htmlFor="password">{t.account.password}</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" className="mt-1.5" />
      </div>
      {state?.error ? (
        <p role="alert" className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
