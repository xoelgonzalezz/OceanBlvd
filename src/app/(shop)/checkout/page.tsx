import Link from "next/link";
import type { Metadata } from "next";
import { UserCheck } from "lucide-react";

import { CheckoutView } from "@/components/checkout/checkout-view";
import { Button } from "@/components/ui/button";
import { getDict } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finalizar compra",
  description: "Completa tus datos de envío para tramitar el pedido.",
  robots: { index: false },
};

export default async function CheckoutPage() {
  const t = getDict();
  const user = await getCurrentUser();

  return (
    <div className="container py-10 md:py-12">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-semibold tracking-tight">
          {t.checkout.title}
        </h1>
        {user ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <UserCheck className="h-4 w-4 text-primary" />
            {t.checkout.buyingAs} <span className="font-medium text-foreground">{user.name}</span>
          </p>
        ) : null}
      </header>

      {!user ? (
        <div className="mb-8 flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{t.checkout.haveAccountTitle}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t.checkout.haveAccountDesc}
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button asChild variant="outline">
              <Link href="/acceso?next=/checkout">{t.account.signIn}</Link>
            </Button>
            <Button asChild>
              <Link href="/registro?next=/checkout">{t.account.signUp}</Link>
            </Button>
          </div>
        </div>
      ) : null}

      <CheckoutView />
    </div>
  );
}
