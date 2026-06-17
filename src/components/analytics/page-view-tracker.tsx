"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

// Marca de sesión: mientras exista, no volvemos a contar la visita. sessionStorage
// se borra al cerrar la pestaña, así que una "visita" = una sesión (al entrar).
const VISIT_KEY = "ob_visited";

/**
 * Cuenta UNA visita por sesión, la primera vez que el usuario entra en la web.
 * No cuenta cada navegación interna. Usa `sendBeacon` (no bloquea la navegación)
 * y no guarda cookies ni datos personales: solo la ruta de entrada.
 */
export function PageViewTracker() {
  const pathname = usePathname();

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pathname || pathname.startsWith("/admin")) return;

    try {
      if (sessionStorage.getItem(VISIT_KEY)) return; // ya contamos esta sesión
      sessionStorage.setItem(VISIT_KEY, "1");
    } catch {
      // Si no hay sessionStorage disponible, seguimos y contamos igualmente.
    }

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
