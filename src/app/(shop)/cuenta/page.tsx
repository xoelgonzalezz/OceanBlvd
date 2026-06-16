import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LogOut, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { getCurrentUser } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/queries";
import { formatDate, formatPrice } from "@/lib/utils";
import { getDict, getLocale } from "@/i18n/server";
import { logoutAction } from "@/app/(shop)/cuenta/actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false },
};

export default async function CuentaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/acceso");

  const orders = await getUserOrders(user.id);
  const t = getDict();
  const locale = getLocale();

  return (
    <div className="container max-w-3xl py-10 md:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            {t.account.hello(user.name)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">
            {t.account.memberSince} {formatDate(user.createdAt, locale)}
          </p>
        </div>
        <form action={logoutAction}>
          <Button variant="outline" type="submit">
            <LogOut /> {t.account.logout}
          </Button>
        </form>
      </div>

      <Separator className="my-8" />

      <h2 className="mb-5 font-serif text-xl font-semibold">
        {t.account.myOrders}
      </h2>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title={t.account.noOrders}
          actionLabel={t.account.browse}
          actionHref="/tienda"
        />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/checkout/exito?order=${order.id}&t=${order.accessToken ?? ""}`}
                className="block rounded-lg border bg-card p-5 transition-colors hover:border-primary/40"
              >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {t.account.order} #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.createdAt, locale)}
                  </p>
                  <span className="mt-1 inline-block rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium">
                    {{
                      PENDING: t.checkout.statusPending,
                      PAID: t.checkout.statusPaid,
                      SHIPPED: t.checkout.statusShipped,
                      CANCELLED: t.checkout.statusCancelled,
                    }[order.status] ?? order.status}
                  </span>
                </div>
                <span className="font-serif font-semibold tabular-nums">
                  {formatPrice(order.totalCents)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="relative h-12 w-12 overflow-hidden rounded bg-muted"
                    title={item.record.title}
                  >
                    <Image
                      src={item.record.images[0]?.url ?? "/placeholders/cover-01.svg"}
                      alt={item.record.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
