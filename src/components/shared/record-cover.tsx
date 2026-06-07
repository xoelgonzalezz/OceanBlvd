import Image from "next/image";

import { cn } from "@/lib/utils";

interface RecordCoverProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Aplica el zoom al hacer hover sobre un ancestro con clase `group`. */
  hover?: boolean;
}

/** Portada cuadrada (como la funda de un vinilo) renderizada con next/image. */
export function RecordCover({
  src,
  alt,
  className,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
  priority = false,
  hover = true,
}: RecordCoverProps) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-md bg-muted",
        className
      )}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover",
          hover &&
            "transition-transform duration-500 ease-out-quint group-hover:scale-[1.04]"
        )}
      />
    </div>
  );
}
