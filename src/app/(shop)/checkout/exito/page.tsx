import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Download, Package, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { ClearCart } from "@/components/checkout/clear-cart";
import { getOrderForConfirmation } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth/session";
import { formatPrice } from "@/lib/utils";
import { PACKLINK_TRACKING_URL } from "@/lib/constants";
import { getDict } from "@/i18n/server";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string; t?: string };
}) {
  const id = searchParams.order;
  const user = await getCurrentUser();
  const order = id
    ? await getOrderForConfirmation(id, searchParams.t, user?.id)
    : null;
  const t = getDict();

  if (!order) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={Package}
          title={t.checkout.notFound}
          description={t.checkout.notFoundDesc}
          actionLabel={t.checkout.backToShop}
          actionHref="/tienda"
        />
      </div>
    );
  }

  const reference = order.id.slice(-8).toUpperCase();
  const statusLabel =
    {
      // En esta página (vuelta del pago) "PENDING" = esperando el webhook de Stripe.
      PENDING: t.checkout.confirmingPayment,
      PAID: t.checkout.statusPaid,
      SHIPPED: t.checkout.statusShipped,
      CANCELLED: t.checkout.statusCancelled,
    }[order.status] ?? order.status;

  return (
    <div className="container max-w-2xl py-14 md:py-20">
      <ClearCart />
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          {t.checkout.successTitle}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {t.checkout.successDesc(reference, order.email)}
        </p>
      </div>

      <div className="mt-8 rounded-lg border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-muted-foreground">
            {t.checkout.orderStatus}
          </span>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium">
            {statusLabel}
          </span>
        </div>
        {order.status === "SHIPPED" && order.trackingNumber && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {t.checkout.trackingTitle}
            </p>
            <p className="mt-1 text-sm">
              {t.checkout.shippedVia(order.carrier ?? "Correos")} ·{" "}
              <span className="font-mono font-medium">{order.trackingNumber}</span>
            </p>
            <Button asChild className="mt-3">
              <a
                href={PACKLINK_TRACKING_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Truck className="h-4 w-4" /> {t.checkout.trackButton}
              </a>
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg border bg-card p-6">
        <h2 className="font-serif text-lg font-semibold">
          {t.checkout.summary}
        </h2>
        <ul className="mt-4 space-y-4">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                <Image
                  src={item.record.images[0]?.url ?? "/placeholders/cover-01.svg"}
                  alt={item.record.title}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="truncate text-sm font-medium">
                  {item.record.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.record.artist.name} · x{item.quantity}
                </p>
              </div>
              <span className="self-center text-sm tabular-nums">
                {formatPrice(item.unitPriceCents * item.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t.cart.subtotal}</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{t.cart.shipping}</dt>
            <dd className="tabular-nums">
              {order.shippingCents === 0
                ? t.cart.free
                : formatPrice(order.shippingCents)}
            </dd>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base">
            <dt className="font-serif font-semibold">{t.cart.total}</dt>
            <dd className="font-serif font-semibold tabular-nums">
              {formatPrice(order.totalCents)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 rounded-md bg-secondary/40 p-4 text-sm">
          <p className="font-medium">{t.checkout.shipTo}</p>
          <p className="mt-1 text-muted-foreground">
            {order.fullName}
            <br />
            {order.address}, {order.postalCode} {order.city}
            <br />
            {order.country}
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href="/tienda">{t.checkout.keepShopping}</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <a
            href={`/recibo/${order.id}?t=${searchParams.t ?? order.accessToken ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download /> {t.checkout.downloadReceipt}
          </a>
        </Button>
      </div>
    </div>
  );
}
