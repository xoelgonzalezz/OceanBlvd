import Image from "next/image";

import { cn } from "@/lib/utils";

const COVER_PLACEHOLDER = "/placeholders/cover-01.svg";

interface SleeveVinylProps {
  /** Portada (la funda). */
  coverUrl?: string | null;
  coverAlt: string;
  /** Foto opcional del vinilo real; si no hay, se dibuja uno con CSS. */
  vinylUrl?: string | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Cuánto asoma el disco en reposo / al hover (en %). */
  peek?: "sm" | "lg";
}

/**
 * Interacción de firma de Ocean Blvd: la funda por delante y el vinilo
 * asomando por la derecha. En reposo apenas se intuye; al hacer hover el
 * disco sale de la funda. Solo `transform` (GPU), curva ease-out fuerte,
 * hover gateado a punteros finos y desactivado con prefers-reduced-motion.
 */
export function SleeveVinyl({
  coverUrl,
  coverAlt,
  vinylUrl,
  className,
  sizes = "(max-width: 640px) 70vw, 40vw",
  priority = false,
  peek = "lg",
}: SleeveVinylProps) {
  const cover = coverUrl || COVER_PLACEHOLDER;
  const restX = peek === "lg" ? "9%" : "6%";
  const hoverX = peek === "lg" ? "38%" : "26%";

  return (
    <div
      className={cn("group/sleeve relative aspect-square", className)}
      style={
        {
          "--peek-rest": restX,
          "--peek-hover": hoverX,
        } as React.CSSProperties
      }
    >
      {/* El disco: sale por detrás de la funda hacia la derecha. */}
      <div
        aria-hidden
        className="absolute inset-y-[3%] right-0 aspect-square translate-x-[var(--peek-rest)] transition-transform duration-500 ease-out-quint motion-safe:[@media(hover:hover)]:group-hover/sleeve:translate-x-[var(--peek-hover)]"
      >
        {vinylUrl ? (
          <div className="relative h-full w-full overflow-hidden rounded-full shadow-sleeve ring-1 ring-foreground/15">
            <Image
              src={vinylUrl}
              alt=""
              fill
              sizes={sizes}
              className="object-cover"
            />
          </div>
        ) : (
          /* Vinilo dibujado con CSS: surcos, brillo y etiqueta central. */
          <div className="relative h-full w-full rounded-full bg-[#15110f] shadow-sleeve ring-1 ring-foreground/15">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,0.055) 0 1px, transparent 1px 3.5px)",
              }}
            />
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_210deg,rgba(255,255,255,0.14),transparent_25%,rgba(255,255,255,0.08)_50%,transparent_72%,rgba(255,255,255,0.12))] opacity-70" />
            {/* Etiqueta central con la portada recortada. */}
            <div className="absolute left-1/2 top-1/2 aspect-square w-[36%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full ring-1 ring-black/40">
              <Image
                src={cover}
                alt=""
                fill
                sizes="15vw"
                className="object-cover"
              />
              <div className="absolute left-1/2 top-1/2 aspect-square w-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/90 ring-1 ring-black/30" />
            </div>
          </div>
        )}
      </div>

      {/* La funda, por delante. Borde de carátula + sombra tintada. */}
      <div className="relative z-10 aspect-square overflow-hidden rounded-[3px] shadow-sleeve-lg ring-1 ring-foreground/10">
        <Image
          src={cover}
          alt={coverAlt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
        {/* Reflejo tenue del canto de la funda. */}
        <div
          aria-hidden
          className="absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-black/18 to-transparent"
        />
      </div>
    </div>
  );
}
