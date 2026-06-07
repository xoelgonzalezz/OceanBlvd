"use client";

import * as React from "react";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useCart } from "@/store/cart";
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
  label = "Añadir al carrito",
  openDrawer = true,
  className,
  ...rest
}: AddToCartButtonProps) {
  const addItem = useCart((s) => s.addItem);
  const setOpen = useCart((s) => s.setOpen);
  const [added, setAdded] = React.useState(false);
  const soldOut = item.stock <= 0;

  function handleClick() {
    if (soldOut) return;
    addItem(item, quantity);
    toast.success("Añadido al carrito", {
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
        "Agotado"
      ) : added ? (
        <>
          <Check /> Añadido
        </>
      ) : (
        <>
          <ShoppingBag /> {label}
        </>
      )}
    </Button>
  );
}
