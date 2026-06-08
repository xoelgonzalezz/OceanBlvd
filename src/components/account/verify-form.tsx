"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";

import {
  verifyAction,
  resendCodeAction,
  type AuthState,
} from "@/app/(shop)/cuenta/actions";
import { useT } from "@/components/i18n/locale-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useT();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? t.verify.verifying : t.verify.submit}
    </Button>
  );
}

export function VerifyForm({ resent = false }: { resent?: boolean }) {
  const t = useT();
  const [state, action] = useFormState(verifyAction, {} as AuthState);

  React.useEffect(() => {
    if (resent) toast.success(t.verify.resent);
  }, [resent, t.verify.resent]);

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <div>
          <Label htmlFor="code">{t.verify.codeLabel}</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            autoFocus
            placeholder="000000"
            className="mt-1.5 text-center text-2xl tracking-[0.4em] tabular-nums"
          />
        </div>
        {state?.error ? (
          <p role="alert" className="text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        <SubmitButton />
      </form>

      <form action={resendCodeAction}>
        <button
          type="submit"
          className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {t.verify.resend}
        </button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        {t.verify.noCode}
      </p>
    </div>
  );
}
