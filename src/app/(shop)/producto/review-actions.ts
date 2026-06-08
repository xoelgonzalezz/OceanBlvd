"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export interface ReviewState {
  error?: string;
  ok?: boolean;
}

export async function submitReviewAction(
  _prev: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Inicia sesión para dejar tu valoración." };

  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") || "").trim().slice(0, 2000);
  const recordId = String(formData.get("recordId") || "");
  const slug = String(formData.get("slug") || "");

  if (!recordId) return { error: "Disco no válido." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Selecciona de 1 a 5 estrellas." };
  }

  try {
    await db.review.upsert({
      where: { userId_recordId: { userId: user.id, recordId } },
      create: { userId: user.id, recordId, rating, comment: comment || null },
      update: { rating, comment: comment || null },
    });
  } catch {
    return { error: "No se pudo guardar la valoración." };
  }

  if (slug) revalidatePath(`/producto/${slug}`);
  return { ok: true };
}

export async function deleteReviewAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const id = String(formData.get("id") || "");
  const slug = String(formData.get("slug") || "");
  if (!id) return;
  try {
    // deleteMany permite filtrar por userId (garantiza que es su reseña).
    await db.review.deleteMany({ where: { id, userId: user.id } });
  } catch {
    /* no es suya o no existe */
  }
  if (slug) revalidatePath(`/producto/${slug}`);
}
