"use client";

import * as React from "react";

import { trackPurchase, type AnalyticsItem } from "@/lib/analytics";

/**
 * Dispara el evento `purchase` (GA4 + Meta) una sola vez por pedido, al llegar
 * a la página de confirmación. Se apoya en sessionStorage para no contar dos
 * veces si el cliente recarga la página.
 */
export function PurchaseTracker({
  orderId,
  totalCents,
  shippingCents,
  items,
}: {
  orderId: string;
  totalCents: number;
  shippingCents: number;
  items: AnalyticsItem[];
}) {
  React.useEffect(() => {
    const key = `ob_purchase_${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* sin sessionStorage: se podría contar dos veces, no es crítico */
    }
    trackPurchase({ orderId, items, valueCents: totalCents, shippingCents });
  }, [orderId, totalCents, shippingCents, items]);

  return null;
}
