import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Ver todo",
  className,
  align = "left",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <span className="section-eyebrow">{eyebrow}</span> : null}
        <h2 className="mt-3 font-display text-4xl font-semibold leading-none text-balance sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:text-primary"
        >
          {linkLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-quint group-hover:translate-x-1" />
        </Link>
      ) : null}
    </div>
  );
}
