import { NextResponse } from "next/server";

import { isAdminRequest } from "@/lib/admin-token";
import { getAdminRecords } from "@/lib/queries";
import { csvCell } from "@/lib/csv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Exporta el catálogo (no archivado) a CSV: id, artista, título, estado, stock, precio. */
export async function GET() {
  if (!(await isAdminRequest())) {
    return new NextResponse("No autorizado", { status: 401 });
  }

  const records = await getAdminRecords();
  const header = ["id", "artista", "titulo", "estado", "stock", "precio_eur"];
  const lines = [header.join(",")];

  for (const r of records) {
    lines.push(
      [
        csvCell(r.id),
        csvCell(r.artist.name),
        csvCell(r.title),
        csvCell(r.condition),
        csvCell(r.stock),
        csvCell((r.priceCents / 100).toFixed(2)),
      ].join(",")
    );
  }

  // BOM inicial para que Excel respete los acentos.
  const csv = "﻿" + lines.join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="stock-ocean-blvd.csv"',
      "Cache-Control": "no-store",
    },
  });
}
