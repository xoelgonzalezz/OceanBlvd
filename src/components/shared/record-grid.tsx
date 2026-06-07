import { Reveal } from "@/components/shared/reveal";
import { ProductCard } from "@/components/shared/product-card";
import { cn } from "@/lib/utils";
import type { RecordCard } from "@/types";

interface RecordGridProps {
  records: RecordCard[];
  className?: string;
  /** Nº de imágenes con prioridad de carga (las visibles al entrar). */
  priorityCount?: number;
  sizes?: string;
}

export function RecordGrid({
  records,
  className,
  priorityCount = 0,
  sizes,
}: RecordGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {records.map((record, i) => (
        <Reveal key={record.id} delay={Math.min(i, 8) * 0.04}>
          <ProductCard
            record={record}
            priority={i < priorityCount}
            sizes={sizes}
          />
        </Reveal>
      ))}
    </div>
  );
}
