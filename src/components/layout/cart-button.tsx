"use client";

import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCart, useCartCount, useCartHydrated } from "@/store/cart";

export function CartButton() {
  const setOpen = useCart((s) => s.setOpen);
  const count = useCartCount();
  const hydrated = useCartHydrated();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Abrir carrito${hydrated && count > 0 ? ` (${count})` : ""}`}
      onClick={() => setOpen(true)}
      className="relative text-foreground/80 hover:text-foreground"
    >
      <ShoppingBag className="h-5 w-5" />
      {hydrated && count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
          {count}
        </span>
      ) : null}
    </Button>
  );
}
