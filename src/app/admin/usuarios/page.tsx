import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Mail, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdminUsers } from "@/lib/queries";
import { formatDate } from "@/lib/utils";
import { deleteUserAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="container py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver al panel
      </Link>

      <div className="mb-8 mt-4">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">
          Usuarios
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users.length} {users.length === 1 ? "cuenta registrada" : "cuentas registradas"}.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="border-b bg-card text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="p-3 font-medium">Usuario</th>
              <th className="p-3 font-medium">Correo</th>
              <th className="hidden p-3 font-medium sm:table-cell">Acceso</th>
              <th className="p-3 text-right font-medium">Pedidos</th>
              <th className="p-3 text-right font-medium">Alta</th>
              <th className="p-3 text-right font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-card/60">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold uppercase">
                      {u.image ? (
                        <Image src={u.image} alt="" fill sizes="36px" className="object-cover" />
                      ) : (
                        u.name.charAt(0)
                      )}
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="p-3">
                  <a
                    href={`mailto:${u.email}`}
                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <Mail className="h-3.5 w-3.5" /> {u.email}
                  </a>
                </td>
                <td className="hidden p-3 sm:table-cell">
                  <Badge variant={u.provider === "google" ? "secondary" : "muted"}>
                    {u.provider === "google" ? "Google" : "Email"}
                  </Badge>
                </td>
                <td className="p-3 text-right tabular-nums">{u._count.orders}</td>
                <td className="p-3 text-right text-muted-foreground">
                  {formatDate(u.createdAt)}
                </td>
                <td className="p-3 text-right">
                  <form action={deleteUserAction} className="inline">
                    <input type="hidden" name="id" value={u.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      title={`Eliminar la cuenta de ${u.name}`}
                      aria-label={`Eliminar la cuenta de ${u.name}`}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
