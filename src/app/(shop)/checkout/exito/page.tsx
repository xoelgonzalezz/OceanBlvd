import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { getOrderById } from "@/lib/queries";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order?: string };
}) {
  const id = searchParams.order;
  const order = id ? await getOrderById(id) : null;

  if (!order) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={Package}
          title="No encontramos ese pedido"
          description="Es posible que el enlace haya caducado."
          actionLabel="Volver a la tienda"
          actionHref="/tienda"
        />
      </div>
    );
  }

  const reference = order.id.slice(-8).toUpperCase();

  return (
    <div className="container max-w-2xl py-14 md:py-20">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h1 className="mt-6 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          ¡Gracias por tu pedido!
        </h1>
        <p className="mt-3 text-muted-foreground">
          Hemos recibido tu pedido{" "}
          <span className="font-medium text-foreground">#{reference}</span>. Te
          hemos enviado la confirmación a{" "}
          <span className="font-medium text-foreground">{order.email}</span>.
        </p>
      </div>

      <div className="mt-10 rounded-lg border bg-card p-6">
        <h2 className="font-serif text-lg font-semibold">Resumen</h2>
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
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="tabular-nums">{formatPrice(order.subtotalCents)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Envío</dt>
            <dd className="tabular-nums">
              {order.shippingCents === 0
                ? "Gratis"
                : formatPrice(order.shippingCents)}
            </dd>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base">
            <dt className="font-serif font-semibold">Total</dt>
            <dd className="font-serif font-semibold tabular-nums">
              {formatPrice(order.totalCents)}
            </dd>
          </div>
        </dl>

        <div className="mt-5 rounded-md bg-secondary/40 p-4 text-sm">
          <p className="font-medium">Enviar a</p>
          <p className="mt-1 text-muted-foreground">
            {order.fullName}
            <br />
            {order.address}, {order.postalCode} {order.city}
            <br />
            {order.country}
          </p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <Link href="/tienda">Seguir comprando</Link>
        </Button>
      </div>
    </div>
  );
}
