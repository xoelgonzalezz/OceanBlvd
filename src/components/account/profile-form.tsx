"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Check, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { updateProfileAction, type AuthState } from "@/app/(shop)/cuenta/actions";
import { useT } from "@/components/i18n/locale-provider";

export interface ProfileInitial {
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {label}
    </Button>
  );
}

export function ProfileForm({ initial }: { initial: ProfileInitial }) {
  const t = useT();
  const [state, formAction] = useFormState(updateProfileAction, {} as AuthState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <Field name="name" label={t.checkout.fullName} defaultValue={initial.name} className="sm:col-span-2" required />
      <Field name="address" label={t.checkout.address} defaultValue={initial.address} className="sm:col-span-2" />
      <Field name="city" label={t.checkout.city} defaultValue={initial.city} />
      <Field name="postalCode" label={t.checkout.postalCode} defaultValue={initial.postalCode} />
      <Field name="country" label={t.checkout.country} defaultValue={initial.country} />
      <Field name="phone" label={t.checkout.phone} defaultValue={initial.phone} />

      <div className="flex items-center gap-3 sm:col-span-2">
        <SaveButton label={t.account.save} />
        {state.success ? (
          <span className="inline-flex items-center gap-1 text-sm text-primary">
            <Check className="h-4 w-4" /> {t.account.saved}
          </span>
        ) : null}
        {state.error ? (
          <span className="text-sm text-destructive">{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  className,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={className}>
      <Label htmlFor={`profile-${name}`}>{label}</Label>
      <Input
        id={`profile-${name}`}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="mt-1.5"
      />
    </div>
  );
}
