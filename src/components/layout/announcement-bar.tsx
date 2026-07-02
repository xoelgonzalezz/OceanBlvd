import { Truck } from "lucide-react";

import { getDict } from "@/i18n/server";

/**
 * Barra superior fija con la propuesta de envío. Comunica coste, umbral de
 * envío gratis y plazo ANTES del checkout (reduce el abandono de carrito).
 * Las cifras salen de las reglas de envío reales (src/lib/constants.ts).
 */
export function AnnouncementBar() {
  const t = getDict();
  return (
    <div className="w-full bg-primary text-primary-foreground">
      <div className="container flex h-9 items-center justify-center gap-2 text-center text-xs font-medium tracking-wide sm:text-[13px]">
        <Truck className="h-4 w-4 shrink-0" aria-hidden />
        <p className="truncate">{t.announcement.shipping}</p>
      </div>
    </div>
  );
}
