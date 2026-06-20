"use client";

import * as React from "react";
import { Info } from "lucide-react";

/**
 * Icono (i) junto al estado del disco. Al pasar el ratón (escritorio) o tocar
 * (móvil) muestra la descripción del grado (Goldmine) en el idioma activo.
 */
export function GradeInfo({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <span ref={ref} className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <span
          role="tooltip"
          className="absolute bottom-full right-0 z-50 mb-1.5 w-56 rounded-md border bg-popover p-2.5 text-xs font-normal leading-relaxed text-popover-foreground shadow-lg"
        >
          {text}
        </span>
      ) : null}
    </span>
  );
}
