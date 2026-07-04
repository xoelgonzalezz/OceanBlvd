import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SleeveVinyl } from "@/components/shared/sleeve-vinyl";
import { ProductCard } from "@/components/shared/product-card";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { Price } from "@/components/shared/price";
import { Reveal } from "@/components/shared/reveal";
import { getDict } from "@/i18n/server";
import type { RecordCard } from "@/types";

/**
 * Destacados en grid asimétrico: una pieza líder grande (con el vinilo
 * asomando de la funda) a la derecha y el resto en una retícula menor.
 * Jerarquía real, no cuatro fundas iguales en fila.
 */
export function FeaturedRecords({ records }: { records: RecordCard[] }) {
  const t = getDict();
  if (!records.length) return null;

  const [lead, ...rest] = records;
  const cover = lead.images[0];
  const secondary = rest.slice(0, 4);

  return (
    <section className="container overflow-hidden py-16 md:py-24">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <span className="section-eyebrow">{t.home.featuredEyebrow}</span>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-none text-balance sm:text-5xl">
            {t.home.featuredTitle}
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            {t.home.featuredDesc}
          </p>
        </div>
      </div>

      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-12">
        {/* Colección secundaria */}
        <div className="order-2 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:order-1 lg:col-span-7">
          {secondary.map((record, i) => (
            <Reveal key={record.id} delay={i * 0.05}>
              <ProductCard
                record={record}
                priority={i < 2}
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 20vw"
              />
            </Reveal>
          ))}
        </div>

        {/* Pieza líder */}
        <Reveal className="order-1 lg:order-2 lg:col-span-5">
          <article className="group flex flex-col">
            <Link
              href={`/producto/${lead.slug}`}
              className="block rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
              aria-label={`${lead.title} — ${lead.artist.name}`}
            >
              <SleeveVinyl
                coverUrl={cover?.url}
                coverAlt={cover?.alt ?? lead.title}
                vinylUrl={lead.vinylImage}
                priority
                sizes="(max-width: 1024px) 92vw, 30vw"
              />
            </Link>
            <div className="mt-6 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {lead.artist.name}
                </p>
                <h3 className="mt-1 font-display text-2xl font-medium leading-tight">
                  <Link
                    href={`/producto/${lead.slug}`}
                    className="transition-colors hover:text-primary"
                  >
                    {lead.title}
                  </Link>
                </h3>
                <div className="mt-2 flex items-center gap-3">
                  <Price cents={lead.priceCents} className="text-lg font-medium" />
                  <ConditionBadge condition={lead.condition} />
                </div>
              </div>
              <Link
                href="/tienda"
                className="group/all mt-1 inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
              >
                {t.home.featuredLink}
                <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-quint group-hover/all:translate-x-1" />
              </Link>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
