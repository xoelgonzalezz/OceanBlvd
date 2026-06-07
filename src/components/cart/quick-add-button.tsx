"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { useT } from "@/components/i18n/locale-provider";
import type { CartItem } from "@/types";

/** Botón rápido (icono) para añadir al carrito desde una tarjeta de producto. */
export function QuickAddButton({
  item,
  className,
}: {
  item: Omit<CartItem, "quantity">;
  className?: string;
}) {
  const addItem = useCart((s) => s.addItem);
  const setOpen = useCart((s) => s.setOpen);
  const t = useT();
  const soldOut = item.stock <= 0;

  function handleClick(e: React.MouseEvent) {
    // La tarjeta es un enlace: evitamos navegar al añadir.
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) return;
    addItem(item, 1);
    toast.success(t.detail.addedToast, {
      description: `${item.title} — ${item.artist}`,
    });
    setOpen(true);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={soldOut}
      aria-label={`Añadir ${item.title} al carrito`}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur-sm transition-all duration-200 ease-out-quint hover:bg-primary hover:text-primary-foreground active:scale-90 disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
    >
      <Plus className="h-4 w-4" />
    </button>
  );
}
