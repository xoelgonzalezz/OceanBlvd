import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { LoginForm } from "@/components/account/login-form";
import { getDict } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";
import { googleEnabled } from "@/lib/auth/google";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false },
};

/** Destino interno seguro: una sola "/" inicial, sin "//", "://" ni "\". */
function isSafeNext(n: string | undefined): n is string {
  return (
    !!n &&
    n.startsWith("/") &&
    !n.startsWith("//") &&
    !n.includes("://") &&
    !n.includes("\\")
  );
}

function googleError(code: string | undefined): string | null {
  if (code === "google") {
    return "No se pudo completar el acceso con Google. Inténtalo de nuevo.";
  }
  if (code === "google_off") {
    return "El acceso con Google no está disponible ahora mismo.";
  }
  return null;
}

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: { next?: string; error?: string };
}) {
  if (await getCurrentUser())
    redirect(isSafeNext(searchParams.next) ? searchParams.next : "/cuenta");
  const t = getDict();
  const errorMsg = googleError(searchParams.error);

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          {t.account.loginTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.account.loginDesc}</p>
        {errorMsg ? (
          <p
            role="alert"
            className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {errorMsg}
          </p>
        ) : null}
        <div className="mt-6">
          <LoginForm
            googleEnabled={googleEnabled}
            next={isSafeNext(searchParams.next) ? searchParams.next : undefined}
          />
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {t.account.noAccount}{" "}
          <Link
            href={
              isSafeNext(searchParams.next)
                ? `/registro?next=${encodeURIComponent(searchParams.next)}`
                : "/registro"
            }
            className="font-medium text-primary hover:underline"
          >
            {t.account.signUp}
          </Link>
        </p>
      </div>
    </div>
  );
}
