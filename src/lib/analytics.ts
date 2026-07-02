// Analítica de ecommerce (cliente). Envía eventos estándar a GA4 (gtag) y a
// Meta Pixel (fbq) SÓLO si el usuario ha dado su consentimiento y los IDs están
// configurados. Todas las funciones son "no-op" seguras: si no hay medición
// cargada, no hacen nada y nunca lanzan. Nunca deben afectar a la navegación.

export type AnalyticsItem = {
  id: string;
  title: string;
  artist?: string;
  priceCents: number;
  quantity?: number;
  condition?: string;
};

type GtagItem = {
  item_id: string;
  item_name: string;
  item_brand?: string;
  item_variant?: string;
  price: number;
  quantity: number;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: ((...args: unknown[]) => void) & { loaded?: boolean };
  }
}

const CURRENCY = "EUR";

/** Céntimos → euros con 2 decimales (number, como pide GA4). */
function euros(cents: number): number {
  return Math.round(cents) / 100;
}

function toGtagItems(items: AnalyticsItem[]): GtagItem[] {
  return items.map((it) => ({
    item_id: it.id,
    item_name: it.title,
    item_brand: it.artist,
    item_variant: it.condition,
    price: euros(it.priceCents),
    quantity: it.quantity ?? 1,
  }));
}

function totalValue(items: AnalyticsItem[]): number {
  return euros(
    items.reduce((sum, it) => sum + it.priceCents * (it.quantity ?? 1), 0)
  );
}

/** Envía un evento a GA4 si gtag está disponible. */
function ga(event: string, params: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", event, params);
  } catch {
    /* la analítica nunca rompe la navegación */
  }
}

/** Envía un evento estándar a Meta Pixel si fbq está disponible. */
function meta(event: string, params: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  try {
    window.fbq("track", event, params);
  } catch {
    /* la analítica nunca rompe la navegación */
  }
}

/* ---- Eventos de ecommerce ---- */

export function trackViewItem(item: AnalyticsItem): void {
  const value = totalValue([item]);
  ga("view_item", {
    currency: CURRENCY,
    value,
    items: toGtagItems([item]),
  });
  meta("ViewContent", {
    content_type: "product",
    content_ids: [item.id],
    content_name: item.title,
    currency: CURRENCY,
    value,
  });
}

export function trackViewItemList(items: AnalyticsItem[], listName?: string): void {
  if (!items.length) return;
  ga("view_item_list", {
    item_list_name: listName,
    items: toGtagItems(items),
  });
}

export function trackAddToCart(item: AnalyticsItem): void {
  const value = totalValue([item]);
  ga("add_to_cart", {
    currency: CURRENCY,
    value,
    items: toGtagItems([item]),
  });
  meta("AddToCart", {
    content_type: "product",
    content_ids: [item.id],
    content_name: item.title,
    currency: CURRENCY,
    value,
  });
}

export function trackBeginCheckout(items: AnalyticsItem[]): void {
  if (!items.length) return;
  const value = totalValue(items);
  ga("begin_checkout", {
    currency: CURRENCY,
    value,
    items: toGtagItems(items),
  });
  meta("InitiateCheckout", {
    content_type: "product",
    content_ids: items.map((i) => i.id),
    currency: CURRENCY,
    value,
    num_items: items.reduce((n, i) => n + (i.quantity ?? 1), 0),
  });
}

export function trackPurchase(params: {
  orderId: string;
  items: AnalyticsItem[];
  valueCents: number;
  shippingCents?: number;
}): void {
  const value = euros(params.valueCents);
  ga("purchase", {
    transaction_id: params.orderId,
    currency: CURRENCY,
    value,
    shipping: euros(params.shippingCents ?? 0),
    items: toGtagItems(params.items),
  });
  meta("Purchase", {
    content_type: "product",
    content_ids: params.items.map((i) => i.id),
    currency: CURRENCY,
    value,
    num_items: params.items.reduce((n, i) => n + (i.quantity ?? 1), 0),
  });
}
