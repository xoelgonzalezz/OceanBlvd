import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Megaphone } from "lucide-react";

import { getAdminRecords } from "@/lib/queries";
import { SocialGenerator } from "@/components/admin/social-generator";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contenido para redes",
  robots: { index: false },
};

export default async function SocialPage() {
  const records = await getAdminRecords();
  const options = records.map((r) => ({
    id: r.id,
    title: r.title,
    artist: r.artist.name,
  }));

  return (
    <div className="container py-10">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al panel
      </Link>

      <div className="mt-4 flex items-start gap-2.5">
        <Megaphone className="mt-1 h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            Contenido para redes
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Elige un disco de tu catálogo y genera ideas de publicación (gancho,
            texto y hashtags) para TikTok e Instagram. Copia y publica.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <SocialGenerator records={options} />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Las ideas son un punto de partida: revísalas y dales tu toque. Publicar
        con constancia es lo que trae visitas.
      </p>
    </div>
  );
}
