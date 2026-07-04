"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Retardo en segundos (para escalonar — stagger). */
  delay?: number;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
}

/**
 * Aparición suave al entrar en el viewport (fade + translateY).
 * Usa IntersectionObserver nativo con un failsafe que SIEMPRE muestra el
 * contenido (nunca lo deja oculto), y respeta prefers-reduced-motion.
 */
export function Reveal({ children, className, delay = 0, y = 14 }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 }
    );
    io.observe(el);

    // Failsafe: pase lo que pase, el contenido se muestra en 1,5s.
    const t = window.setTimeout(() => setShown(true), 1500);

    return () => {
      io.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transform: shown ? "none" : `translateY(${y}px)`,
        transitionDelay: shown ? `${delay}s` : "0s",
      }}
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out-quint",
        shown ? "opacity-100" : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
