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
  searchParams: { resent?: string };
}) {
  // Sin verificación pendiente, no hay nada que hacer aquí.
  if (!cookies().get(PENDING_COOKIE)?.value) redirect("/acceso");
  const t = getDict();

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8 text-center">
        <MailCheck className="mx-auto h-8 w-8" />
        <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
          {t.verify.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.verify.desc}</p>
        <div className="mt-6 text-left">
          <VerifyForm resent={searchParams.resent === "1"} />
        </div>
      </div>
    </div>
  );
}
