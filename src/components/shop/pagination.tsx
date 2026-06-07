"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const pathname = usePathname();
  const sp = useSearchParams();

  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const params = new URLSearchParams(sp.toString());
    if (p <= 1) params.delete("page");
    else params.set("page", String(p));
    const q = params.toString();
    return q ? `${pathname}?${q}` : pathname;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      aria-label="Paginación"
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      <PageLink
        href={href(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </PageLink>

      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors",
            p === page
              ? "bg-primary text-primary-foreground"
              : "border border-input hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {p}
        </Link>
      ))}

      <PageLink
        href={href(page + 1)}
        disabled={page >= totalPages}
        aria-label="Página siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
  ...rest
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
} & React.AriaAttributes) {
  if (disabled) {
    return (
      <span
        className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-md border border-input text-muted-foreground opacity-40"
        {...rest}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-input transition-colors hover:bg-accent hover:text-accent-foreground"
      {...rest}
    >
      {children}
    </Link>
  );
}
