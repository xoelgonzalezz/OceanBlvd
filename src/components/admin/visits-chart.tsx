import { BarChart3, MapPin } from "lucide-react";

interface Day {
  date: string; // YYYY-MM-DD
  count: number;
}

interface City {
  city: string;
  country: string | null;
  count: number;
}

function label(date: string): string {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}

/**
 * Gráfico de visitas (una por sesión) para el panel. Barras en CSS puro, una
 * por día, con totales de referencia y un ranking de ciudades estimadas por IP.
 */
export function VisitsChart({ data, cities }: { data: Day[]; cities: City[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const last7 = data.slice(-7).reduce((s, d) => s + d.count, 0);
  const today = data.at(-1)?.count ?? 0;
  const max = Math.max(1, ...data.map((d) => d.count));
  const topCity = Math.max(1, ...cities.map((c) => c.count));

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
          <div className="flex h-40 items-end gap-[3px]">
            {data.map((d) => (
              <div
                key={d.date}
                className="group relative flex-1 rounded-t-sm bg-foreground/85 transition-colors hover:bg-foreground"
                style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
                title={`${label(d.date)}: ${d.count} ${d.count === 1 ? "visita" : "visitas"}`}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
            <span>{label(data[0].date)}</span>
            <span>{label(data[data.length - 1].date)}</span>
          </div>
        </div>
      )}

      <div className="mt-6 border-t pt-5">
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
    </section>
  );
}
