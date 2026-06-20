import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { safeImg } from "@/lib/utils";
import { getDict } from "@/i18n/server";
import type { RecordCard } from "@/types";

export function Hero({ record }: { record: RecordCard | null }) {
  const t = getDict();
  const cover = record?.images[0];
  // Foto del vinilo real (si el admin la ha puesto y el host está permitido).
  // Si no, caemos en el disco genérico generado por CSS.
  const vinyl = record?.vinylImage ? safeImg(record.vinylImage, "") : "";
  // ¿Gira como disco (foto de frente) o se muestra como imagen normal destacada?
  const spin = record?.vinylSpin ?? true;
  const stillImage = vinyl && !spin ? vinyl : "";

  // Pie con «edición exclusiva» + título + artista (reutilizado en los modos).
  const caption = record ? (
    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      <span className="block text-[11px] font-medium uppercase tracking-[0.18em] text-white/80">
        {t.hero.exclusive}
      </span>
      <span className="block font-serif text-lg font-medium text-white">
        {record.title}
      </span>
      <span className="block text-sm text-white/80">{record.artist.name}</span>
    </span>
  ) : null;

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

        {/* Visual: o bien una imagen destacada normal, o bien portada + vinilo girando */}
        <div className="relative mx-auto aspect-square w-full max-w-[20rem] animate-scale-in opacity-0 [animation-delay:200ms] sm:max-w-md">
          {stillImage && record ? (
            /* Modo «imagen normal»: la foto de producto, entera y quieta, SIN
               marco ni recorte, para que un PNG transparente flote sobre el
               fondo. La sombra sigue la silueta (drop-shadow), no un cuadrado. */
            <Link
              href={`/producto/${record.slug}`}
              className="group relative z-10 block aspect-square w-full"
            >
              <Image
                src={stillImage}
                alt={cover?.alt ?? record.title}
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-contain drop-shadow-2xl transition-transform duration-700 ease-out-quint group-hover:scale-[1.03]"
              />
            </Link>
          ) : (
            <>
              {vinyl ? (
                /* Foto del vinilo real (gestionada desde el admin), girando. */
                <div className="absolute right-0 top-1/2 aspect-square w-[74%] -translate-y-1/2 overflow-hidden rounded-full shadow-2xl ring-1 ring-black/20 motion-safe:animate-spin-slow sm:right-[-8%] sm:w-[82%]">
                  <Image
                    src={vinyl}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 60vw, 30vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                /* Vinilo genérico (CSS): negro liso con etiqueta neutra. NO lleva la
                   portada del álbum (un vinilo real no la lleva en la etiqueta), así
                   no mostramos nada que no sea cierto. Es solo decorativo. */
                <div
                  className="absolute right-0 top-1/2 aspect-square w-[74%] -translate-y-1/2 rounded-full shadow-2xl ring-1 ring-black/20 motion-safe:animate-spin-slow sm:right-[-8%] sm:w-[82%]"
                  style={{
                    background:
                      "repeating-radial-gradient(circle at center, #131313 0px, #131313 1.5px, #242424 3px, #242424 4.5px)",
                  }}
                >
                  {/* Etiqueta central lisa (color neutro), no la carátula. */}
                  <div className="absolute left-1/2 top-1/2 h-[34%] w-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-800 ring-1 ring-black/40" />
                  <div className="absolute left-1/2 top-1/2 h-[3.5%] w-[3.5%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background ring-1 ring-black/30" />
                </div>
              )}

              {/* Portada exclusiva (delante del disco) */}
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
                  {caption}
                </Link>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
