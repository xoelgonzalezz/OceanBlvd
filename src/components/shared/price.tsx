import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Price({
  cents,
  className,
}: {
  cents: number;
  className?: string;
}) {
  return (
    <span className={cn("tabular-nums", className)}>{formatPrice(cents)}</span>
  );
}
