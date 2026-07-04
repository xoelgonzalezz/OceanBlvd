import { getDict } from "@/i18n/server";

/**
 * Momento editorial grande: una cita a toda página sobre el ritual de escuchar,
 * con número de catálogo y grano. Rompe el ritmo de retículas y da a la tienda
 * un respiro de revista.
 */
export function EditorialMoment() {
  const t = getDict();

  return (
    <section className="grain relative overflow-hidden border-y border-border/70 bg-secondary/40 py-20 md:py-28">
      <div className="container relative grid items-start gap-10 lg:grid-cols-12">
        <div className="order-2 lg:order-1 lg:col-span-3">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            {t.home.editorialTag}
          </p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t.home.editorialNote}
          </p>
        </div>

        <blockquote className="order-1 lg:order-2 lg:col-span-9">
          <p className="font-display-italic text-3xl font-normal leading-[1.08] text-balance sm:text-4xl lg:text-[3.5rem]">
            {t.home.editorialQuote}
          </p>
        </blockquote>
      </div>
    </section>
  );
}
