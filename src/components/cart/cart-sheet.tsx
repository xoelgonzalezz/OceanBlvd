"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCart, useCartSubtotal } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  calcShipping,
  FREE_SHIPPING_THRESHOLD_CENTS,
} from "@/lib/constants";
import { useT } from "@/components/i18n/locale-provider";

export function CartSheet() {
  const t = useT();
  const items = useCart((s) => s.items);
  const isOpen = useCart((s) => s.isOpen);
  const setOpen = useCart((s) => s.setOpen);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const subtotal = useCartSubtotal();

  const shipping = calcShipping(subtotal);
  const remaining = FREE_SHIPPING_THRESHOLD_CENTS - subtotal;

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-5 text-left">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            {t.cart.your}
            {items.length > 0 ? (
              <span className="text-sm font-normal text-muted-foreground">
                ({items.reduce((n, i) => n + i.quantity, 0)})
              </span>
            ) : null}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-serif text-lg font-medium">
                {t.cart.emptyTitle}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t.cart.drawerEmptyDesc}
              </p>
            </div>
            <Button asChild onClick={() => setOpen(false)}>
              <Link href="/tienda">{t.cart.emptyAction}</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Aviso de envío gratis */}
            {remaining > 0 ? (
              <p className="bg-secondary/60 px-6 py-2.5 text-center text-xs text-secondary-foreground">
                {t.cart.freeProgress(formatPrice(remaining))}
              </p>
            ) : (
              <p className="bg-primary/10 px-6 py-2.5 text-center text-xs font-medium text-primary">
                {t.cart.freeReached}
              </p>
            )}

            <ScrollArea className="flex-1">
              <ul className="divide-y px-6">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4">
                    <Link
                      href={`/producto/${item.slug}`}
                      onClick={() => setOpen(false)}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
                    >
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link
                        href={`/producto/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="block truncate text-sm font-medium hover:text-primary"
                      >
                        {item.title}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.artist}
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="flex items-center rounded-md border">
                          <button
                            type="button"
                            aria-label={t.detail.decreaseQty}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={t.detail.increaseQty}
                            disabled={item.quantity >= item.stock}
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-medium tabular-nums">
                          {formatPrice(item.priceCents * item.quantity)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      aria-label={`${t.cart.remove} ${item.title}`}
                      onClick={() => removeItem(item.id)}
                      className="-m-2 self-start p-2 text-muted-foreground transition-colors hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <SheetFooter className="flex-col gap-0 border-t px-6 py-5 sm:flex-col sm:space-x-0">
              <dl className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t.cart.subtotal}</dt>
                  <dd className="font-medium tabular-nums">
                    {formatPrice(subtotal)}
                  </dd>
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

              <div className="mt-4 flex flex-col gap-2">
                <Button asChild size="lg" onClick={() => setOpen(false)}>
                  <Link href="/checkout">{t.cart.checkout}</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="text-muted-foreground"
                >
                  <Link href="/carrito">{t.cart.viewCart}</Link>
                </Button>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
