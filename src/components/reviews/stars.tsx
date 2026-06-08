import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Muestra una puntuación de 0 a 5 con relleno fraccionario. */
export function Stars({
  value,
  starClass = "h-4 w-4",
  className,
}: {
  value: number;
  starClass?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const stars = Array.from({ length: 5 });

  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span className="flex text-muted-foreground/30">
        {stars.map((_, i) => (
          <Star key={i} className={starClass} />
        ))}
      </span>
      <span
        className="absolute inset-0 flex overflow-hidden text-primary"
        style={{ width: `${pct}%` }}
      >
        {stars.map((_, i) => (
          <Star key={i} className={cn(starClass, "shrink-0 fill-current")} />
        ))}
      </span>
    </span>
  );
}
