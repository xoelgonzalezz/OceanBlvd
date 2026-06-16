import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ExternalLink, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminOrders } from "@/lib/queries";
import { markOrderShippedAction } from "@/app/admin/actions";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, correosTrackingUrl } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** Color del distintivo de estado. */
const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PAID: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  SHIPPED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  CANCELLED: "bg-destructive/10 text-destructive",
};

/** Avisos tras una acción (?msg=...). */
const MESSAGES: Record<string, string> = {
  "order-shipped":
    "Pedido marcado como enviado. Hemos mandado al comprador un email con el enlace de seguimiento.",
  "tracking-required":
    "Escribe el número de seguimiento (localizador) de Correos antes de marcarlo como enviado.",
  "order-missing": "Ese pedido ya no existe.",
  "order-not-payable":
    "Solo puedes marcar como enviado un pedido que ya esté pagado.",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { msg?: string };
}) {
  const orders = await getAdminOrders();
  const notice = searchParams.msg ? MESSAGES[searchParams.msg] : null;

  return (
    <div className="container py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al panel
      </Link>

      <div className="mb-8 mt-4">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Pedidos
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}.
        </p>
      </div>

      {notice && (
        <div className="mb-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          {notice}
        </div>
      )}

      {orders.length === 0 ? (
        <p className="rounded-lg border bg-card p-8 text-center text-sm text-muted-foreground">
          Todavía no hay pedidos. Cuando alguien compre, aparecerán aquí para que
          puedas gestionar el envío.
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const ref = order.id.slice(-8).toUpperCase();
            const date = new Date(order.createdAt).toLocaleString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            const canShip = order.status === "PAID" || order.status === "SHIPPED";

            return (
              <div key={order.id} className="rounded-lg border bg-card p-5">
                {/* Cabecera: referencia, fecha, estado, total */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      Pedido #{ref}
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{date}</p>
                  </div>
                  <span className="font-serif text-lg font-semibold tabular-nums">
                    {formatPrice(order.totalCents)}
                  </span>
                </div>

                {/* Artículos */}
                <div className="mt-4 flex flex-wrap gap-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                        <Image
                          src={item.record.images[0]?.url ?? "/placeholders/cover-01.svg"}
                          alt=""
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 text-xs">
                        <p className="truncate font-medium">{item.record.title}</p>
                        <p className="truncate text-muted-foreground">
                          {item.record.artist.name} · x{item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Datos de envío del comprador */}
                <div className="mt-4 rounded-md bg-secondary/40 p-3 text-sm">
                  <p className="font-medium">{order.fullName}</p>
                  <p className="text-muted-foreground">
                    {order.address}, {order.postalCode} {order.city} ({order.country})
                  </p>
                  <p className="text-muted-foreground">
                    {order.email}
                    {order.phone ? ` · ${order.phone}` : ""}
                  </p>
                  {order.notes && (
                    <p className="mt-1 text-muted-foreground">Nota: {order.notes}</p>
                  )}
                </div>

                {/* Gestión del envío */}
                {order.status === "PENDING" && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Esperando el pago. Cuando Stripe confirme el cobro podrás añadir
                    el seguimiento.
                  </p>
                )}
                {order.status === "CANCELLED" && (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Pedido cancelado.
                  </p>
                )}
                {canShip && (
                  <div className="mt-4 border-t pt-4">
                    {order.status === "SHIPPED" && order.trackingNumber && (
                      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
                        <Truck className="h-4 w-4 text-emerald-600" />
                        <span>Enviado por {order.carrier ?? "Correos"} ·</span>
                        <span className="font-mono font-medium">
                          {order.trackingNumber}
                        </span>
                        <a
                          href={correosTrackingUrl(order.trackingNumber)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary underline"
                        >
                          Seguir <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    )}
                    <form
                      action={markOrderShippedAction}
                      className="flex flex-wrap items-end gap-2"
                    >
                      <input type="hidden" name="id" value={order.id} />
                      <div className="min-w-[200px] flex-1">
                        <label
                          htmlFor={`tracking-${order.id}`}
                          className="mb-1 block text-xs text-muted-foreground"
                        >
                          Nº de seguimiento de Correos (localizador)
                        </label>
                        <Input
                          id={`tracking-${order.id}`}
                          name="trackingNumber"
                          defaultValue={order.trackingNumber ?? ""}
                          placeholder="Ej. PQ1234567890ES"
                          required
                        />
                      </div>
                      <Button type="submit">
                        <Truck className="h-4 w-4" />
                        {order.status === "SHIPPED"
                          ? "Actualizar seguimiento"
                          : "Marcar enviado"}
                      </Button>
                    </form>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Al guardar, el comprador recibe un email con el enlace de
                      seguimiento.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
