import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { RegisterForm } from "@/components/account/register-form";
import { getDict } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Crear cuenta",
  robots: { index: false },
};

export default async function RegistroPage() {
  if (await getCurrentUser()) redirect("/cuenta");
  const t = getDict();

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          {t.account.registerTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t.account.registerDesc}
        </p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          {t.account.haveAccount}{" "}
          <Link href="/acceso" className="font-medium text-primary hover:underline">
            {t.account.signIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
