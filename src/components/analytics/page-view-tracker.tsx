"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Registra una visita cada vez que cambia la ruta. Usa `sendBeacon` (no bloquea
 * la navegación) y cae a `fetch` con keepalive si no está disponible. No usa
 * cookies ni envía datos personales: solo la ruta visitada.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  React.useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const body = JSON.stringify({ path: pathname });
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track",
          new Blob([body], { type: "application/json" })
        );
      } else {
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
          keepalive: true,
        });
      }
    } catch {
      // La analítica nunca debe afectar a la experiencia del usuario.
    }
  }, [pathname]);

  return null;
}
