import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SleeveVinyl } from "@/components/shared/sleeve-vinyl";
import { safeImg } from "@/lib/utils";
import { getDict } from "@/i18n/server";
import type { RecordCard } from "@/types";

export function Hero({ record }: { record: RecordCard | null }) {
  const t = getDict();
  const cover = record?.images[0];
  const vinyl = record?.vinylImage ? safeImg(record.vinylImage, "") : "";

  return (
    <section className="grain relative overflow-hidden border-b border-border/70">
      <div className="container relative grid items-center gap-12 py-16 sm:py-20 md:py-24 lg:grid-cols-12 lg:gap-8">
        {/* Columna editorial */}
        <div className="lg:col-span-5">
          <span className="section-eyebrow animate-fade-up opacity-0 [animation-delay:0ms]">
            {t.hero.eyebrow}
          </span>

          <h1 className="mt-5 animate-fade-up font-display text-[2.7rem] font-semibold leading-[0.98] text-balance opacity-0 [animation-delay:70ms] sm:text-6xl lg:text-[4.4rem]">
            {t.hero.titleA}{" "}
            <em className="font-display-italic font-normal text-primary">
              {t.hero.titleB}
            </em>
          </h1>

          <p className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-muted-foreground opacity-0 [animation-delay:150ms] sm:text-lg">
            {t.hero.subtitle}
          </p>

          <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-x-6 gap-y-3 opacity-0 [animation-delay:230ms]">
            <Button asChild size="lg">
              <Link href="/tienda">{t.hero.browse}</Link>
            </Button>
            <Link
              href="/tienda?sort=newest"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {t.hero.newReleases}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-quint group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* El disco protagonista, ligeramente inclinado como sobre una mesa. */}
        {record && cover ? (
          <div className="animate-scale-in opacity-0 [animation-delay:180ms] lg:col-span-6 lg:col-start-7">
            <figure className="mx-auto max-w-[19rem] sm:max-w-sm lg:max-w-md">
              <Link
                href={`/producto/${record.slug}`}
                className="block rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                aria-label={`${record.title} — ${record.artist.name}`}
              >
                <SleeveVinyl
                  coverUrl={cover.url}
                  coverAlt={cover.alt ?? record.title}
                  vinylUrl={vinyl || null}
                  priority
                  sizes="(max-width: 1024px) 80vw, 34vw"
                  className="rotate-[-3deg] transition-transform duration-500 ease-out-quint hover:rotate-0"
                />
              </Link>
              {/* Cartela tipo placa de galería. */}
              <figcaption className="mt-7 flex items-baseline justify-between gap-4 border-t border-border/70 pt-4">
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-medium leading-tight">
                    {record.title}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {record.artist.name}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {record.label} · {record.year}
                </p>
              </figcaption>
            </figure>
          </div>
        ) : null}
      </div>
    </section>
  );
}
