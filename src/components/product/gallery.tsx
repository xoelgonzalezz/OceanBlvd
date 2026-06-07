"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

export function Gallery({
  images,
}: {
  images: { url: string; alt: string }[];
}) {
  const [active, setActive] = React.useState(0);
  const main = images[active] ?? images[0];

  if (!main) return null;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
        <Image
          src={main.url}
          alt={main.alt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
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
