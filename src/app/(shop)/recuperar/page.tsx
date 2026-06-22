import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { RequestResetForm } from "@/components/account/request-reset-form";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Recuperar contraseña",
  robots: { index: false },
};

export default async function RecuperarPage() {
  // Si ya hay sesión, no tiene sentido recuperar la contraseña.
  if (await getCurrentUser()) redirect("/cuenta");

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8">
        <h1 className="font-serif text-2xl font-semibold tracking-tight">
          Recuperar contraseña
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Introduce tu correo y te enviaremos un enlace para crear una nueva
          contraseña.
        </p>
        <div className="mt-6">
          <RequestResetForm />
        </div>
        <p className="mt-5 text-center text-sm text-muted-foreground">
          <Link
            href="/acceso"
            className="font-medium text-primary hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
