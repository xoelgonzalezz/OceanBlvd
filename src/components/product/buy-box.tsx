"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { useT } from "@/components/i18n/locale-provider";
import { trackViewItem } from "@/lib/analytics";
import type { CartItem } from "@/types";

export function BuyBox({ item }: { item: Omit<CartItem, "quantity"> }) {
  const [qty, setQty] = React.useState(1);
  const t = useT();
  const soldOut = item.stock <= 0;

  // view_item: se dispara una vez al abrir la ficha de producto.
  React.useEffect(() => {
    trackViewItem({
      id: item.id,
      title: item.title,
      artist: item.artist,
      priceCents: item.priceCents,
      condition: item.condition,
    });
    // Sólo cuando cambia el producto mostrado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
      {!soldOut ? (
        <div className="flex items-center justify-between rounded-md border sm:justify-start">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label={t.detail.decreaseQty}
            className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-base font-medium tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(item.stock, q + 1))}
            disabled={qty >= item.stock}
            aria-label={t.detail.increaseQty}
            className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <AddToCartButton
        item={item}
        quantity={qty}
        size="lg"
        className="flex-1"
      />
    </div>
  );
}
