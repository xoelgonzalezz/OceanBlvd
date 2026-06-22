import Link from "next/link";
import { Euro, ShoppingBag, TrendingUp, CalendarDays, Trophy } from "lucide-react";

import { formatPrice } from "@/lib/utils";
import type { SalesStats, TopRecord } from "@/lib/queries";

/**
 * Resumen de ventas para el panel: ingresos, pedidos, ticket medio, facturación
 * del mes y ranking de discos más vendidos. Solo cuenta pedidos pagados.
 */
export function SalesPanel({
  stats,
  top,
}: {
  stats: SalesStats;
  top: TopRecord[];
}) {
  const cards = [
    {
      icon: Euro,
      label: "Ingresos totales",
      value: formatPrice(stats.revenueCents),
    },
    {
      icon: ShoppingBag,
      label: "Pedidos pagados",
      value: String(stats.orders),
    },
    {
      icon: TrendingUp,
      label: "Ticket medio",
      value: formatPrice(stats.aovCents),
    },
    {
      icon: CalendarDays,
      label: "Este mes",
      value: formatPrice(stats.revenueMonthCents),
      sub: `${stats.ordersMonth} ${stats.ordersMonth === 1 ? "pedido" : "pedidos"}`,
    },
  ];

  return (
    <section className="mt-8 rounded-lg border p-5">
      <div className="flex items-start gap-2.5">
        <Euro className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div>
          <h2 className="font-serif text-xl font-semibold tracking-tight">
            Ventas
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Solo pedidos con el pago confirmado (pagados o enviados).
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border bg-card p-4">
            <c.icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
              {c.label}
            </p>
            <p className="mt-1 text-xl font-semibold tabular-nums">{c.value}</p>
            {c.sub ? (
              <p className="text-xs text-muted-foreground">{c.sub}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-5">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <Trophy className="h-4 w-4 text-muted-foreground" /> Más vendidos
        </h3>
        {top.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Aún no hay ventas registradas. Cuando se confirme el primer pedido,
            aquí verás tu ranking de discos.
          </p>
        ) : (
          <ol className="mt-3 space-y-2">
            {top.map((r, i) => (
              <li
                key={r.id}
                className="flex items-center gap-3 text-sm"
              >
                <span className="w-5 shrink-0 text-center font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <Link
                  href={`/producto/${r.slug}`}
                  target="_blank"
                  className="min-w-0 flex-1 truncate hover:underline"
                >
                  <span className="font-medium">{r.title}</span>{" "}
                  <span className="text-muted-foreground">· {r.artist}</span>
                </Link>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {r.salesCount} {r.salesCount === 1 ? "ud." : "uds."}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
