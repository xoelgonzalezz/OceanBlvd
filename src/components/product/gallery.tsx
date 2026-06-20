"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function Gallery({
  images,
}: {
  images: { url: string; alt: string }[];
}) {
  const [active, setActive] = React.useState(0);
  const main = images[active] ?? images[0];
  const multiple = images.length > 1;

  // Pasa a la imagen anterior/siguiente (con vuelta circular).
  const move = (dir: number) =>
    setActive((a) => (a + dir + images.length) % images.length);

  if (!main) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="group relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
        <Image
          src={main.url}
          alt={main.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />

        {multiple ? (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur transition hover:bg-background focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur transition hover:bg-background focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "relative aspect-square w-20 shrink-0 overflow-hidden rounded-md ring-1 transition-all duration-200 ease-out-quint",
                i === active
                  ? "ring-2 ring-primary"
                  : "ring-border/60 hover:ring-primary/50"
              )}
            >
              <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
