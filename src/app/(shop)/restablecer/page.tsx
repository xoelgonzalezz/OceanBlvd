import Link from "next/link";
import type { Metadata } from "next";

import { ResetPasswordForm } from "@/components/account/reset-password-form";
import { validateResetToken } from "@/lib/auth/reset";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Restablecer contraseña",
  robots: { index: false },
};

export default async function RestablecerPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  const userId = token ? await validateResetToken(token) : null;

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Nueva contraseña
        </h1>

        {userId ? (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Elige una contraseña nueva para tu cuenta.
            </p>
            <div className="mt-6">
              <ResetPasswordForm token={token} />
            </div>
          </>
        ) : (
          <>
            <p
              role="alert"
              className="mt-4 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
            >
              El enlace no es válido o ha caducado. Los enlaces solo duran 30
              minutos y se pueden usar una vez.
            </p>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              <Link
                href="/recuperar"
                className="font-medium text-primary hover:underline"
              >
                Solicitar un enlace nuevo
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
