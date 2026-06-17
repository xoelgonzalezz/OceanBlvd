import Image from "next/image";
import Link from "next/link";
import {
  Pencil,
  Plus,
  Trash2,
  Users,
  LogOut,
  Newspaper,
  Contact,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VisitsChart } from "@/components/admin/visits-chart";
import {
  getAdminRecords,
  getVisitsByDay,
  getTopCities,
  getTopSources,
} from "@/lib/queries";
import { formatPrice } from "@/lib/utils";
import { CONDITION_LABELS } from "@/lib/constants";
import { deleteRecordAction, logoutAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

/** Avisos tras borrar/archivar (?msg=...). */
const MESSAGES: Record<string, string> = {
  "record-deleted": "Vinilo eliminado.",
  "record-archived":
    "Este vinilo ya tenía ventas, así que lo hemos archivado: desaparece de la tienda y del panel, pero se conserva el historial de pedidos.",
  "record-error":
    "No se pudo eliminar el vinilo. Inténtalo de nuevo o revisa si está en algún pedido.",
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: { msg?: string };
}) {
  const [records, visits, cities, sources] = await Promise.all([
    getAdminRecords(),
    getVisitsByDay(30),
    getTopCities(30),
    getTopSources(30),
  ]);
  const notice = searchParams.msg ? MESSAGES[searchParams.msg] : null;

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Catálogo
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {records.length} vinilos en la tienda.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/pedidos">
              <Package /> Pedidos
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/artists">
              <Users /> Artistas
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/blog">
              <Newspaper /> Blog
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/usuarios">
              <Contact /> Usuarios
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/records/new">
              <Plus /> Nuevo vinilo
            </Link>
          </Button>
          <form action={logoutAction}>
            <Button
              variant="ghost"
              type="submit"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut />
            </Button>
          </form>
        </div>
      </div>

      {notice && (
        <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          {notice}
        </div>
      )}

      <VisitsChart data={visits} cities={cities} sources={sources} />

      <div className="mt-8 overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="border-b bg-card text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Vinilo</th>
              <th className="hidden p-3 font-medium md:table-cell">Estado</th>
              <th className="hidden p-3 font-medium sm:table-cell">Stock</th>
              <th className="p-3 text-right font-medium">Precio</th>
              <th className="p-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-card/60">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                      <Image
                        src={r.images[0]?.url ?? "/placeholders/cover-01.svg"}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {r.artist.name} · {r.year}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="hidden p-3 md:table-cell">
                  <Badge variant={r.condition === "NEW" ? "default" : "secondary"}>
                    {CONDITION_LABELS[r.condition] ?? r.condition}
                  </Badge>
                </td>
                <td className="hidden p-3 tabular-nums sm:table-cell">
                  {r.stock}
                </td>
                <td className="p-3 text-right font-medium tabular-nums">
                  {formatPrice(r.priceCents)}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      title="Editar"
                    >
                      <Link
                        href={`/admin/records/${r.id}/edit`}
                        aria-label={`Editar ${r.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                    <form action={deleteRecordAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <Button
                        variant="ghost"
                        size="icon"
                        type="submit"
                        title="Eliminar"
                        aria-label={`Eliminar ${r.title}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
