import type { CartItem, RecordCard, RecordWithRelations } from "@/types";

/** Convierte un disco de la base de datos en un ítem listo para el carrito. */
export function toCartItem(
  r: RecordCard | RecordWithRelations
): Omit<CartItem, "quantity"> {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    artist: r.artist.name,
    priceCents: r.priceCents,
    image: r.images[0]?.url ?? "/placeholders/cover-01.svg",
    condition: r.condition,
    stock: r.stock,
  };
}
