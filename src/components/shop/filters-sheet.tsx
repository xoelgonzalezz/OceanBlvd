"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FilterSidebar } from "@/components/shop/filter-sidebar";
import { useT } from "@/components/i18n/locale-provider";
import type { FilterFacets } from "@/types";

const COUNT_KEYS = ["genre", "artist", "decade", "condition"];

export function FiltersSheet({ facets }: { facets: FilterFacets }) {
  const [open, setOpen] = React.useState(false);
  const sp = useSearchParams();
  const t = useT();

  let count = COUNT_KEYS.reduce((n, k) => {
    const v = sp.get(k);
    return v ? n + v.split(",").filter(Boolean).length : n;
  }, 0);
  if (sp.get("min") || sp.get("max")) count += 1;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="lg:hidden">
          <SlidersHorizontal className="h-4 w-4" />
          {t.shop.filters}
          {count > 0 ? ` (${count})` : ""}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-[88vw] max-w-sm flex-col p-0">
        <SheetHeader className="sr-only">
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <FilterSidebar facets={facets} />
        </div>

        <div className="border-t p-4">
          <Button className="w-full" onClick={() => setOpen(false)}>
            {t.shop.results}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
