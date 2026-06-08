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

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  if (await getCurrentUser()) redirect(searchParams.next?.startsWith("/") ? searchParams.next : "/cuenta");
  const t = getDict();

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          {t.account.loginTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.account.loginDesc}</p>
        <div className="mt-6">
          <LoginForm googleEnabled={googleEnabled} next={searchParams.next} />
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {t.account.noAccount}{" "}
          <Link
            href={
              searchParams.next
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
