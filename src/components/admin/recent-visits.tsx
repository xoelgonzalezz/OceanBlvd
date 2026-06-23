import { Clock } from "lucide-react";

import type { RecentVisit } from "@/lib/queries";

// Fecha + hora en la zona horaria de España (independiente del servidor).
const fmt = new Intl.DateTimeFormat("es-ES", {
  timeZone: "Europe/Madrid",
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Lista de las últimas visitas individuales con su fecha y hora exactas. Útil
 * sobre todo con poco tráfico, para ver al detalle quién entra y cuándo.
 */
export function RecentVisits({ visits }: { visits: RecentVisit[] }) {
  return (
    <section className="mt-8 rounded-lg border p-5">
      <div className="flex items-start gap-2.5">
        <Clock className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div>
          <h2 className="font-serif text-xl font-semibold tracking-tight">
            Últimas visitas
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Hora de cada visita reciente (hora de España).
          </p>
        </div>
      </div>

      {visits.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed py-8 text-center text-sm text-muted-foreground">
          Aún no hay visitas registradas.
        </p>
      ) : (
        <ul className="mt-4 divide-y text-sm">
          {visits.map((v) => (
            <li
              key={v.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5"
            >
              <span className="w-[7.5rem] shrink-0 font-medium tabular-nums">
                {fmt.format(v.createdAt)}
              </span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
                {v.source ?? "Directo"}
              </span>
              <span className="text-xs text-muted-foreground">
                {v.city
                  ? `${v.city}${v.country ? ` · ${v.country}` : ""}`
                  : "—"}
              </span>
              <span className="ml-auto max-w-[45%] truncate text-xs text-muted-foreground">
                {v.path}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
