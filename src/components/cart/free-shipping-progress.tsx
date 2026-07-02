"use client";

import { cn, formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD_CENTS } from "@/lib/constants";
import { useT } from "@/components/i18n/locale-provider";

/**
 * Barra de progreso hacia el envío gratis. Muestra cuánto falta para alcanzar
 * el umbral y una barra visual que se llena con el subtotal del carrito.
 * Incentiva a subir el importe medio del pedido.
 */
export function FreeShippingProgress({
  subtotal,
  className,
}: {
  subtotal: number;
  className?: string;
}) {
  const t = useT();
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotal);
  const reached = remaining <= 0;
  const pct = reached
    ? 100
    : Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD_CENTS) * 100));

  return (
    <div className={className}>
      <p
        className={cn(
          "text-center text-xs",
          reached ? "font-medium text-primary" : "text-secondary-foreground"
        )}
      >
        {reached ? t.cart.freeReached : t.cart.freeProgress(formatPrice(remaining))}
      </p>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-border"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.cart.shipping}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
