"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SORT_OPTIONS } from "@/lib/constants";
import { useT } from "@/components/i18n/locale-provider";

const SORT_KEY = {
  newest: "newest",
  popular: "popular",
  "price-asc": "priceAsc",
  "price-desc": "priceDesc",
  az: "az",
} as const;

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const t = useT();
  const current = sp.get("sort") ?? "newest";

  function onChange(value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value === "newest") params.delete("sort");
    else params.set("sort", value);
    params.delete("page");
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  return (
    <Select value={current} onValueChange={onChange}>
      <SelectTrigger
        className="w-full min-w-[150px] sm:w-[185px]"
        aria-label={t.shop.sortBy}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SORT_OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {t.shop.sort[SORT_KEY[o.value]]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
