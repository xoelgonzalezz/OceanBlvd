import { BarChart3 } from "lucide-react";

interface Day {
  date: string; // YYYY-MM-DD
  count: number;
}

function label(date: string): string {
  const [, m, d] = date.split("-");
  return `${d}/${m}`;
}

/**
 * Gráfico de visitas a la web para el panel. Barras en CSS puro (sin
 * dependencias), una por día. Muestra totales de referencia y un estado vacío
 * cuando todavía no hay tráfico registrado.
 */
export function VisitsChart({ data }: { data: Day[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const last7 = data.slice(-7).reduce((s, d) => s + d.count, 0);
  const today = data.at(-1)?.count ?? 0;
  const max = Math.max(1, ...data.map((d) => d.count));

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
              Páginas vistas en los últimos {data.length} días.
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
    </section>
  );
}
