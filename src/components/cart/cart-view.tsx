"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { useCart, useCartHydrated, useCartSubtotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  calcShipping,
  FREE_SHIPPING_THRESHOLD_CENTS,
} from "@/lib/constants";

export function CartView() {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const clear = useCart((s) => s.clear);
  const subtotal = useCartSubtotal();
  const hydrated = useCartHydrated();

  const shipping = calcShipping(subtotal);
  const remaining = FREE_SHIPPING_THRESHOLD_CENTS - subtotal;

  // Evita parpadeo durante la hidratación del carrito (localStorage).
  if (!hydrated) {
    return <div className="h-64" aria-hidden />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Tu carrito está vacío"
        description="Cuando añadas discos aparecerán aquí. Échale un ojo al catálogo."
        actionLabel="Explorar catálogo"
        actionHref="/tienda"
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
      {/* Líneas */}
      <ul className="divide-y border-t">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 py-5 sm:gap-6">
            <Link
              href={`/producto/${item.slug}`}
              className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted sm:h-28 sm:w-28"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="112px"
                className="object-cover"
              />
            </Link>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/producto/${item.slug}`}
                    className="font-serif text-lg font-medium leading-snug hover:text-primary"
                  >
                    {item.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">{item.artist}</p>
                </div>
                <button
                  type="button"
                  aria-label={`Quitar ${item.title}`}
                  onClick={() => removeItem(item.id)}
                  className="h-fit text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center rounded-md border">
                  <button
                    type="button"
                    aria-label="Reducir cantidad"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-9 text-center text-sm tabular-nums">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Aumentar cantidad"
                    disabled={item.quantity >= item.stock}
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="font-medium tabular-nums">
                  {formatPrice(item.priceCents * item.quantity)}
                </span>
              </div>
            </div>
          </li>
        ))}

        <li className="py-4">
          <button
            type="button"
            onClick={clear}
            className="text-sm text-muted-foreground transition-colors hover:text-destructive"
          >
            Vaciar carrito
          </button>
        </li>
      </ul>

      {/* Resumen */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-serif text-lg font-semibold">Resumen del pedido</h2>

          {remaining > 0 ? (
            <p className="mt-3 rounded-md bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
              Te faltan{" "}
              <span className="font-semibold">{formatPrice(remaining)}</span> para
              el envío gratis.
            </p>
          ) : (
            <p className="mt-3 rounded-md bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              ¡Tienes envío gratis! 🎉
            </p>
          )}

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Envío</dt>
              <dd className="font-medium tabular-nums">
                {shipping === 0 ? "Gratis" : formatPrice(shipping)}
              </dd>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base">
              <dt className="font-serif font-semibold">Total</dt>
              <dd className="font-serif font-semibold tabular-nums">
                {formatPrice(subtotal + shipping)}
              </dd>
            </div>
          </dl>

          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">
              Tramitar pedido
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link href="/tienda">Seguir comprando</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
