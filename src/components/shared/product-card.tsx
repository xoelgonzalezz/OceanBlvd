import Link from "next/link";

import { RecordCover } from "@/components/shared/record-cover";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { Price } from "@/components/shared/price";
import { QuickAddButton } from "@/components/cart/quick-add-button";
import { getDict } from "@/i18n/server";
import { toCartItem } from "@/lib/mappers";
import { cn } from "@/lib/utils";
import type { RecordCard } from "@/types";

interface ProductCardProps {
  record: RecordCard;
  priority?: boolean;
  sizes?: string;
  className?: string;
}

export function ProductCard({
  record,
  priority,
  sizes,
  className,
}: ProductCardProps) {
  const cover = record.images[0];
  const t = getDict();

  return (
    <div className={cn("group relative flex flex-col", className)}>
      <Link
        href={`/producto/${record.slug}`}
        className="flex flex-1 flex-col focus:outline-none"
      >
        <div className="relative">
          <RecordCover
            src={cover?.url ?? "/placeholders/cover-01.svg"}
            alt={cover?.alt ?? `${record.title} — ${record.artist.name}`}
            priority={priority}
            sizes={sizes}
            hover={false}
            className="rounded-[3px] shadow-sleeve ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-200 ease-out-quint [@media(hover:hover)]:group-hover:-translate-y-1 group-hover:shadow-sleeve-lg"
          />
          <ConditionBadge
            condition={record.condition}
            className="absolute left-3 top-3"
          />
          {record.stock <= 0 ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-md bg-background/70 text-sm font-medium uppercase tracking-wide backdrop-blur-sm">
              {t.card.soldOut}
            </span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-1 flex-col">
          <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
            {record.artist.name}
          </p>
          <h3 className="mt-0.5 line-clamp-2 font-serif text-base font-medium leading-snug text-foreground transition-colors group-hover:text-primary">
            {record.title}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <Price cents={record.priceCents} className="font-medium" />
            <span className="text-xs text-muted-foreground">{record.year}</span>
          </div>
        </div>
      </Link>

      {/* Overlay hermano del Link (no descendiente del <a>): cubre la
          portada cuadrada y ancla el botón a su esquina inferior derecha. */}
      {record.stock <= 0 ? null : (
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-square">
          <div className="pointer-events-auto absolute bottom-3 right-3 translate-y-1 opacity-0 transition-[opacity,transform] duration-200 ease-out-quint group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <QuickAddButton item={toCartItem(record)} />
          </div>
        </div>
      )}
    </div>
  );
}
