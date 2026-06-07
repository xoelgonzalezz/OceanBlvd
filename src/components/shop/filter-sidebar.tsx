"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CONDITION_LABELS } from "@/lib/constants";
import { decadeLabel, formatPrice } from "@/lib/utils";
import type { FilterFacets } from "@/types";

const FILTER_KEYS = ["genre", "artist", "decade", "condition", "min", "max", "q"];

export function FilterSidebar({
  facets,
  onNavigate,
}: {
  facets: FilterFacets;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const minEuro = Math.floor(facets.minPrice / 100);
  const maxEuro = Math.ceil(facets.maxPrice / 100);

  const urlMin = sp.get("min");
  const urlMax = sp.get("max");
  const [range, setRange] = React.useState<[number, number]>([
    urlMin ? Number(urlMin) : minEuro,
    urlMax ? Number(urlMax) : maxEuro,
  ]);

  React.useEffect(() => {
    setRange([urlMin ? Number(urlMin) : minEuro, urlMax ? Number(urlMax) : maxEuro]);
  }, [urlMin, urlMax, minEuro, maxEuro]);

  const getList = (key: string) =>
    sp.get(key)?.split(",").filter(Boolean) ?? [];

  const pushParams = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(sp.toString());
    mutate(params);
    params.delete("page");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
    onNavigate?.();
  };

  const toggle = (key: string, value: string) =>
    pushParams((p) => {
      const cur = p.get(key)?.split(",").filter(Boolean) ?? [];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });

  const commitPrice = () =>
    pushParams((p) => {
      if (range[0] > minEuro) p.set("min", String(range[0]));
      else p.delete("min");
      if (range[1] < maxEuro) p.set("max", String(range[1]));
      else p.delete("max");
    });

  const clearAll = () =>
    pushParams((p) => FILTER_KEYS.forEach((k) => p.delete(k)));

  const hasActive = FILTER_KEYS.some((k) => sp.get(k));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-semibold">Filtros</h2>
        {hasActive ? (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Limpiar todo
          </button>
        ) : null}
      </div>

      <FilterGroup label="Género">
        {facets.genres.map((g) => (
          <FilterRow
            key={g.slug}
            label={g.name}
            count={g._count.records}
            checked={getList("genre").includes(g.slug)}
            onChange={() => toggle("genre", g.slug)}
          />
        ))}
      </FilterGroup>

      <Separator />

      <FilterGroup label="Estado">
        {["NEW", "USED"].map((c) => (
          <FilterRow
            key={c}
            label={CONDITION_LABELS[c]}
            checked={getList("condition").includes(c)}
            onChange={() => toggle("condition", c)}
          />
        ))}
      </FilterGroup>

      <Separator />

      <FilterGroup label="Década">
        {facets.decades.map((d) => (
          <FilterRow
            key={d}
            label={decadeLabel(d)}
            checked={getList("decade").includes(String(d))}
            onChange={() => toggle("decade", String(d))}
          />
        ))}
      </FilterGroup>

      <Separator />

      <FilterGroup label="Precio">
        <div className="px-1 pt-2">
          <Slider
            value={range}
            min={minEuro}
            max={maxEuro}
            step={1}
            minStepsBetweenThumbs={1}
            onValueChange={(v) => setRange([v[0], v[1]])}
            onValueCommit={commitPrice}
            aria-label="Rango de precio"
          />
          <div className="mt-3 flex items-center justify-between text-sm tabular-nums text-muted-foreground">
            <span>{formatPrice(range[0] * 100)}</span>
            <span>{formatPrice(range[1] * 100)}</span>
          </div>
        </div>
      </FilterGroup>

      <Separator />

      <FilterGroup label="Artista">
        <ScrollArea className="-mr-3 h-56 pr-3">
          <div className="space-y-0.5">
            {facets.artists.map((a) => (
              <FilterRow
                key={a.slug}
                label={a.name}
                count={a._count.records}
                checked={getList("artist").includes(a.slug)}
                onChange={() => toggle("artist", a.slug)}
              />
            ))}
          </div>
        </ScrollArea>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function FilterRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md py-1.5 text-sm transition-colors hover:text-primary">
      <Checkbox checked={checked} onCheckedChange={onChange} />
      <span className="flex-1">{label}</span>
      {count != null ? (
        <span className="text-xs tabular-nums text-muted-foreground">
          {count}
        </span>
      ) : null}
    </label>
  );
}
