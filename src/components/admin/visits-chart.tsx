"use client";

import * as React from "react";
import { BarChart3, MapPin, Radio } from "lucide-react";

import { cn } from "@/lib/utils";

interface Day {
  date: string; // YYYY-MM-DD
  count: number;
}

interface City {
  city: string;
  country: string | null;
  count: number;
}

interface Source {
  source: string;
  count: number;
}

function label(date: string): string {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}

/** Fecha completa en español, p. ej. "miércoles, 18 de junio". */
function fullLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Gráfico de visitas (una por sesión) para el panel. Barras en CSS puro, una
 * por día. Se puede hacer clic en cada barra para ver el desglose de ese día
 * (fecha, número de visitas y % del total). Incluye ranking de ciudades y
 * orígenes estimados.
 */
export function VisitsChart({
  data,
  cities,
  sources,
  sourcesByDay,
}: {
  data: Day[];
  cities: City[];
  sources: Source[];
  sourcesByDay: Record<string, { source: string; count: number }[]>;
}) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const last7 = data.slice(-7).reduce((s, d) => s + d.count, 0);
  const today = data.at(-1)?.count ?? 0;
  const max = Math.max(1, ...data.map((d) => d.count));
  const topCity = Math.max(1, ...cities.map((c) => c.count));
  const topSource = Math.max(1, ...sources.map((s) => s.count));

  // Día seleccionado: por defecto el último (hoy).
  const [selected, setSelected] = React.useState<number | null>(
    data.length ? data.length - 1 : null
  );
  const sel = selected != null ? data[selected] : null;
  const selSources = sel ? sourcesByDay[sel.date] ?? [] : [];

  return (
    <section className="mt-8 rounded-lg border p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-2.5">
          <BarChart3 className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight">
              Visitas a la web
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Visitas (una por sesión) en los últimos {data.length} días.
            </p>
          </div>
        </div>
        <dl className="flex gap-6">
          <div className="text-right">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Total
            </dt>
            <dd className="text-2xl font-semibold tabular-nums">{total}</dd>
          </div>
          <div className="text-right">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              7 días
            </dt>
            <dd className="text-2xl font-semibold tabular-nums">{last7}</dd>
          </div>
          <div className="text-right">
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              Hoy
            </dt>
            <dd className="text-2xl font-semibold tabular-nums">{today}</dd>
          </div>
        </dl>
      </div>

      {total === 0 ? (
        <p className="mt-8 rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
          Aún no hay visitas registradas. En cuanto la gente entre en la web,
          aquí verás el tráfico día a día.
        </p>
      ) : (
        <div className="mt-6">
          {/* Desglose del día seleccionado */}
          {sel && (
            <div className="mb-3 rounded-md bg-secondary/40 px-3 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium capitalize">
                  {fullLabel(sel.date)}
                </span>
                <span className="shrink-0 text-sm tabular-nums">
                  {sel.count} {sel.count === 1 ? "visita" : "visitas"}
                  <span className="text-muted-foreground">
                    {" "}
                    · {Math.round((sel.count / total) * 100)}% del total
                  </span>
                </span>
              </div>
              {selSources.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">
                    De dónde
                  </span>
                  {selSources.map((s) => (
                    <span
                      key={s.source}
                      className="rounded-full bg-background px-2 py-0.5 text-xs"
                    >
                      {s.source}{" "}
                      <span className="tabular-nums text-muted-foreground">
                        {s.count}
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                sel.count > 0 && (
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Sin datos de origen para este día.
                  </p>
                )
              )}
            </div>
          )}

          <div className="flex h-40 items-end gap-[3px]">
            {data.map((d, i) => (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelected(i)}
                aria-label={`${label(d.date)}: ${d.count} ${d.count === 1 ? "visita" : "visitas"}`}
                aria-pressed={i === selected}
                title={`${label(d.date)}: ${d.count} ${d.count === 1 ? "visita" : "visitas"}`}
                className={cn(
                  "flex-1 cursor-pointer rounded-t-sm border-0 p-0 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  i === selected
                    ? "bg-primary"
                    : "bg-foreground/85 hover:bg-foreground"
                )}
                style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>{label(data[0].date)}</span>
            <span>{label(data[data.length - 1].date)}</span>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-8 border-t pt-5 sm:grid-cols-2">
        <div>
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <MapPin className="h-4 w-4 text-muted-foreground" /> Ciudades estimadas
        </h3>
        {cities.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Todavía sin datos de ciudad. Se estima por IP cuando entra alguien
            (solo en la web desplegada, no en local).
          </p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {cities.map((c) => (
              <li key={`${c.city}-${c.country ?? ""}`} className="text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">
                    {c.city}
                    {c.country ? (
                      <span className="text-muted-foreground"> · {c.country}</span>
                    ) : null}
                  </span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    {c.count}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/70"
                    style={{ width: `${(c.count / topCity) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>

        <div>
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Radio className="h-4 w-4 text-muted-foreground" /> De dónde llegan
          </h3>
          {sources.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Todavía sin datos de origen. Aquí verás de qué canal viene cada
              visita (TikTok, Google, Directo…).
            </p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {sources.map((s) => (
                <li key={s.source} className="text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate">{s.source}</span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {s.count}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground/70"
                      style={{ width: `${(s.count / topSource) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
