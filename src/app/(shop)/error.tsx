"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * Frontera de error de la tienda: si una página falla (datos inválidos, etc.)
 * mostramos un aviso amable en vez de un 500 crudo, con opción de reintentar.
 */
export default function ShopError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <h1 className="font-serif text-3xl font-semibold tracking-tight">
        Algo ha ido mal
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        No hemos podido cargar esta página. Vuelve a intentarlo o regresa a la
        tienda.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Reintentar</Button>
        <Button asChild variant="outline">
          <Link href="/tienda">Volver a la tienda</Link>
        </Button>
      </div>
    </div>
  );
}
