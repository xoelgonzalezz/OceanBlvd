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
import { useT } from "@/components/i18n/locale-provider";

export function CartView() {
  const t = useT();
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
        title={t.cart.emptyTitle}
        description={t.cart.emptyDesc}
        actionLabel={t.cart.emptyAction}
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
                  aria-label={`${t.cart.remove} ${item.title}`}
                  onClick={() => removeItem(item.id)}
                  className="-m-2 h-fit p-2 text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center rounded-md border">
                  <button
                    type="button"
                    aria-label={t.detail.decreaseQty}
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
                    aria-label={t.detail.increaseQty}
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
            {t.cart.clear}
          </button>
        </li>
      </ul>

      {/* Resumen */}
      <aside className="h-fit lg:sticky lg:top-24">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="font-serif text-lg font-semibold">{t.cart.summary}</h2>

          {remaining > 0 ? (
            <p className="mt-3 rounded-md bg-secondary/60 px-3 py-2 text-xs text-secondary-foreground">
              {t.cart.freeProgress(formatPrice(remaining))}
            </p>
          ) : (
            <p className="mt-3 rounded-md bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
              {t.cart.freeReached}
            </p>
          )}

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.cart.subtotal}</dt>
              <dd className="font-medium tabular-nums">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t.cart.shipping}</dt>
              <dd className="font-medium tabular-nums">
                {shipping === 0 ? t.cart.free : formatPrice(shipping)}
              </dd>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base">
              <dt className="font-serif font-semibold">{t.cart.total}</dt>
              <dd className="font-serif font-semibold tabular-nums">
                {formatPrice(subtotal + shipping)}
              </dd>
            </div>
          </dl>

          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">
              {t.cart.checkout}
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full">
            <Link href="/tienda">{t.cart.keepShopping}</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
