"use client";

import * as React from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart } from "@/store/cart";
import { useT } from "@/components/i18n/locale-provider";
import { trackAddToCart } from "@/lib/analytics";
import type { CartItem } from "@/types";

interface AddToCartButtonProps extends Omit<ButtonProps, "children"> {
  item: Omit<CartItem, "quantity">;
  quantity?: number;
  label?: string;
  openDrawer?: boolean;
}

export function AddToCartButton({
  item,
  quantity = 1,
  label,
  openDrawer = true,
  className,
  ...rest
}: AddToCartButtonProps) {
  const addItem = useCart((s) => s.addItem);
  const setOpen = useCart((s) => s.setOpen);
  const t = useT();
  const [added, setAdded] = React.useState(false);
  const soldOut = item.stock <= 0;

  function handleClick() {
    if (soldOut) return;
    addItem(item, quantity);
    trackAddToCart({
      id: item.id,
      title: item.title,
      artist: item.artist,
      priceCents: item.priceCents,
      quantity,
      condition: item.condition,
    });
    toast.success(t.detail.addedToast, {
      description: `${item.title} — ${item.artist}`,
    });
    if (openDrawer) setOpen(true);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <Button
      onClick={handleClick}
      disabled={soldOut}
      className={className}
      {...rest}
    >
      {soldOut ? (
        t.detail.soldOut
      ) : added ? (
        <>
          <Check /> {t.detail.added}
        </>
      ) : (
        <>
          <ShoppingBag /> {label ?? t.detail.addToCart}
        </>
      )}
    </Button>
  );
}
