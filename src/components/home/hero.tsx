import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDict } from "@/i18n/server";
import type { RecordCard } from "@/types";

export function Hero({ record }: { record: RecordCard | null }) {
  const t = getDict();
  const cover = record?.images[0];

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      {/* Flourishes de fondo (monocromo) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 -top-24 h-[28rem] w-[28rem] rounded-full bg-foreground/[0.05] blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-[24rem] w-[24rem] rounded-full bg-foreground/[0.03] blur-3xl" />
      </div>

      <div className="container grid items-center gap-10 py-14 sm:py-16 md:py-24 lg:grid-cols-2 lg:gap-10">
        {/* Texto */}
        <div className="max-w-xl">
          <span className="section-eyebrow animate-fade-up opacity-0 [animation-delay:0ms]">
            <Sparkles className="h-3.5 w-3.5" />
            {t.hero.eyebrow}
          </span>

          <h1 className="mt-4 animate-fade-up text-balance font-serif text-3xl font-semibold leading-[1.06] tracking-tight opacity-0 [animation-delay:80ms] sm:text-4xl md:text-5xl lg:text-6xl">
            {t.hero.titleA}{" "}
            <span className="text-primary">{t.hero.titleB}</span>
          </h1>

          <p className="mt-5 max-w-md animate-fade-up text-base leading-relaxed text-muted-foreground opacity-0 [animation-delay:160ms] sm:text-lg">
            {t.hero.subtitle}
          </p>

          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 opacity-0 [animation-delay:240ms]">
            <Button asChild size="lg">
              <Link href="/tienda">
                {t.hero.browse}
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tienda?sort=newest">{t.hero.newReleases}</Link>
            </Button>
          </div>

          <ul className="mt-10 flex animate-fade-up flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground opacity-0 [animation-delay:320ms]">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              {t.hero.shipping}
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t.hero.guaranteed}
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              {t.hero.curated}
            </li>
          </ul>
        </div>

        {/* Visual: portada exclusiva + vinilo girando */}
        <div className="relative mx-auto aspect-square w-full max-w-[20rem] animate-scale-in opacity-0 [animation-delay:200ms] sm:max-w-md">
          {/* Vinilo verde de la edición exclusiva, girando, con la portada en la etiqueta */}
          <div
            className="absolute right-0 top-1/2 aspect-square w-[74%] -translate-y-1/2 rounded-full shadow-2xl ring-1 ring-black/20 motion-safe:animate-spin-slow sm:right-[-8%] sm:w-[82%]"
            style={{
              background:
                "repeating-radial-gradient(circle at center, #6cb873 0px, #6cb873 1.5px, #a9dcab 3px, #a9dcab 4.5px)",
            }}
          >
            {cover ? (
              <div className="absolute left-1/2 top-1/2 h-[36%] w-[36%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-2 ring-black/15">
                <Image
                  src={cover.url}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            ) : null}
            <div className="absolute left-1/2 top-1/2 h-[3.5%] w-[3.5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background ring-1 ring-black/30" />
          </div>

          {/* Portada exclusiva (Lana Del Rey) */}
          {cover && record ? (
            <Link
              href={`/producto/${record.slug}`}
              className="group relative z-10 block aspect-square w-[82%] overflow-hidden rounded-lg shadow-2xl ring-1 ring-border/60"
            >
              <Image
                src={cover.url}
                alt={cover.alt}
                fill
                priority
                sizes="(max-width: 1024px) 80vw, 40vw"
                className="object-cover transition-transform duration-700 ease-out-quint group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
                  {t.hero.exclusive}
                </span>
                <span className="block font-serif text-lg font-medium text-white">
                  {record.title}
                </span>
                <span className="block text-sm text-white/80">
                  {record.artist.name}
                </span>
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
