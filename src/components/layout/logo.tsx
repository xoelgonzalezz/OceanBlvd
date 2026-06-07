import Link from "next/link";
import { Disc3 } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Ocean Blvd Vinyl, ir al inicio"
      className={cn("group flex shrink-0 items-center gap-2", className)}
    >
      <Disc3 className="h-6 w-6 text-primary transition-transform duration-700 ease-out-quint group-hover:rotate-180" />
      <span className="font-serif text-lg font-semibold leading-none tracking-tight">
        Ocean Blvd <span className="text-primary">Vinyl</span>
      </span>
    </Link>
  );
}
