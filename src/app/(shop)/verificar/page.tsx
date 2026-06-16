import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { MailCheck } from "lucide-react";

import { PENDING_COOKIE } from "@/lib/auth/token";
import { VerifyForm } from "@/components/account/verify-form";
import { getDict } from "@/i18n/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Verificar cuenta",
  robots: { index: false },
};

export default function VerificarPage({
  searchParams,
}: {
  searchParams: { resent?: string; error?: string };
}) {
  // Sin verificación pendiente, no hay nada que hacer aquí.
  if (!cookies().get(PENDING_COOKIE)?.value) redirect("/acceso");
  const t = getDict();
  const errorMsg =
    searchParams.error === "wait"
      ? "Has pedido códigos demasiado rápido. Espera un minuto antes de volver a intentarlo."
      : null;

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 text-center">
        <MailCheck className="mx-auto h-8 w-8" />
        <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
          {t.verify.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.verify.desc}</p>
        {errorMsg ? (
          <p
            role="alert"
            className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {errorMsg}
          </p>
        ) : null}
        <div className="mt-6 text-left">
          <VerifyForm resent={searchParams.resent === "1"} />
        </div>
      </div>
    </div>
  );
}
