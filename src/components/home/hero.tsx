import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RecordCard } from "@/types";

export function Hero({ record }: { record: RecordCard | null }) {
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
            Tienda independiente de vinilo
          </span>

          <h1 className="mt-4 animate-fade-up text-balance font-serif text-3xl font-semibold leading-[1.06] tracking-tight opacity-0 [animation-delay:80ms] sm:text-4xl md:text-5xl lg:text-6xl">
            Vinilos con alma,{" "}
            <span className="text-primary">elegidos a mano.</span>
          </h1>

          <p className="mt-5 max-w-md animate-fade-up text-base leading-relaxed text-muted-foreground opacity-0 [animation-delay:160ms] sm:text-lg">
            Novedades, ediciones especiales y joyas de segunda mano. Una
            selección cuidada para quienes escuchan la música como se merece.
          </p>

          <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 opacity-0 [animation-delay:240ms]">
            <Button asChild size="lg">
              <Link href="/tienda">
                Explorar catálogo
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/tienda?sort=newest">Ver novedades</Link>
            </Button>
          </div>

          <ul className="mt-10 flex animate-fade-up flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground opacity-0 [animation-delay:320ms]">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              Envío 24–48h
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Estado garantizado
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Selección de autor
            </li>
          </ul>
        </div>

        {/* Visual: portada exclusiva + vinilo girando */}
        <div className="relative mx-auto aspect-square w-full max-w-[20rem] animate-scale-in opacity-0 [animation-delay:200ms] sm:max-w-md">
          {/* Disco de vinilo monocromo asomando y girando */}
          <div className="absolute right-0 top-1/2 aspect-square w-[72%] -translate-y-1/2 rounded-full bg-[repeating-radial-gradient(circle_at_center,#0a0a0a_0px,#0a0a0a_1px,#1c1c1c_2px,#1c1c1c_3px)] shadow-2xl ring-1 ring-white/5 motion-safe:animate-spin-slow sm:right-[-8%] sm:w-[80%]">
            <div className="absolute left-1/2 top-1/2 h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
            <div className="absolute left-1/2 top-1/2 h-[4%] w-[4%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
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
                  Edición exclusiva
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
