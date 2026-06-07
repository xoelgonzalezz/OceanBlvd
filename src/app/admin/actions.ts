"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { slugify, decadeOf } from "@/lib/utils";
import { findCover } from "@/lib/cover-search";
import { ADMIN_COOKIE, ADMIN_PASSWORD, adminSessionToken } from "@/lib/admin-token";

export interface ActionState {
  error?: string;
}

/* ---------- Autenticación ---------- */

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const password = String(formData.get("password") || "");
  if (password !== ADMIN_PASSWORD) {
    return { error: "Contraseña incorrecta." };
  }
  const token = await adminSessionToken();
  cookies().set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/admin");
}

export async function logoutAction() {
  cookies().delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/* ---------- Helpers ---------- */

function revalidateShop(slug?: string) {
  revalidatePath("/");
  revalidatePath("/tienda");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/producto/${slug}`);
}

function parseTracks(text: string) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [title, duration] = line.split("|").map((s) => s.trim());
      return { position: i + 1, title: title || `Pista ${i + 1}`, duration: duration || null };
    });
}

type ParsedRecord =
  | { error: string }
  | {
      data: {
        title: string;
        artistId: string;
        genreId: string;
        label: string;
        year: number;
        priceCents: number;
        condition: string;
        mediaGrade: string | null;
        stock: number;
        description: string;
        featured: boolean;
      };
      tracks: { position: number; title: string; duration: string | null }[];
      coverUrl: string;
    };

function parseRecordForm(formData: FormData): ParsedRecord {
  const title = String(formData.get("title") || "").trim();
  const artistId = String(formData.get("artistId") || "").trim();
  const genreId = String(formData.get("genreId") || "").trim();
  const label = String(formData.get("label") || "").trim();
  const year = Number(formData.get("year"));
  const priceEuros = Number(
    String(formData.get("price") || "").replace(",", ".")
  );
  const condition = String(formData.get("condition") || "USED");
  const mediaGrade = String(formData.get("mediaGrade") || "").trim();
  const stock = Number(formData.get("stock")) || 1;
  const description = String(formData.get("description") || "").trim();
  const featured = formData.get("featured") === "on";
  const coverUrl = String(formData.get("coverUrl") || "").trim();
  const tracksText = String(formData.get("tracks") || "");

  if (!title) return { error: "El título es obligatorio." };
  if (!artistId) return { error: "Selecciona un artista." };
  if (!genreId) return { error: "Selecciona un género." };
  if (!label) return { error: "Indica el sello discográfico." };
  if (!Number.isFinite(year) || year < 1900 || year > 2100)
    return { error: "Indica un año válido." };
  if (!Number.isFinite(priceEuros) || priceEuros <= 0)
    return { error: "Indica un precio válido." };
  if (!description) return { error: "Añade una descripción." };

  return {
    data: {
      title,
      artistId,
      genreId,
      label,
      year,
      priceCents: Math.round(priceEuros * 100),
      condition: condition === "NEW" ? "NEW" : "USED",
      mediaGrade: mediaGrade || null,
      stock: Math.max(0, stock),
      description,
      featured,
    },
    tracks: parseTracks(tracksText),
    coverUrl,
  };
}

async function uniqueRecordSlug(base: string): Promise<string> {
  let slug = base || "vinilo";
  let i = 2;
  while (await db.record.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

/* ---------- CRUD de vinilos ---------- */

export async function createRecordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = parseRecordForm(formData);
  if ("error" in parsed) return parsed;

  const artist = await db.artist.findUnique({ where: { id: parsed.data.artistId } });
  if (!artist) return { error: "Artista no válido." };

  const slug = await uniqueRecordSlug(slugify(`${artist.name} ${parsed.data.title}`));

  try {
    await db.record.create({
      data: {
        ...parsed.data,
        slug,
        decade: decadeOf(parsed.data.year),
        images: {
          create: [
            {
              url: parsed.coverUrl || "/placeholders/cover-01.svg",
              alt: `Portada de ${parsed.data.title} de ${artist.name}`,
              position: 0,
            },
          ],
        },
        tracks: { create: parsed.tracks },
      },
    });
  } catch {
    return { error: "No se pudo crear el vinilo." };
  }

  revalidateShop(slug);
  redirect("/admin");
}

export async function updateRecordAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Falta el identificador." };

  const parsed = parseRecordForm(formData);
  if ("error" in parsed) return parsed;

  const existing = await db.record.findUnique({ where: { id } });
  if (!existing) return { error: "El vinilo no existe." };

  const artist = await db.artist.findUnique({ where: { id: parsed.data.artistId } });
  if (!artist) return { error: "Artista no válido." };

  try {
    await db.$transaction([
      db.track.deleteMany({ where: { recordId: id } }),
      db.recordImage.deleteMany({ where: { recordId: id } }),
      db.record.update({
        where: { id },
        data: {
          ...parsed.data,
          decade: decadeOf(parsed.data.year),
          images: {
            create: [
              {
                url: parsed.coverUrl || "/placeholders/cover-01.svg",
                alt: `Portada de ${parsed.data.title} de ${artist.name}`,
                position: 0,
              },
            ],
          },
          tracks: { create: parsed.tracks },
        },
      }),
    ]);
  } catch {
    return { error: "No se pudo guardar el vinilo." };
  }

  revalidateShop(existing.slug);
  redirect("/admin");
}

export async function deleteRecordAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;
  try {
    await db.record.delete({ where: { id } });
  } catch {
    // Puede estar referenciado por un pedido; lo ignoramos en la demo.
  }
  revalidateShop();
  redirect("/admin");
}

/* ---------- CRUD de artistas ---------- */

export async function createArtistAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const image = String(formData.get("image") || "").trim();
  const country = String(formData.get("country") || "").trim();
  const foundedYearRaw = formData.get("foundedYear");
  const featured = formData.get("featured") === "on";

  if (!name) return { error: "El nombre es obligatorio." };
  if (!bio) return { error: "Añade una biografía." };

  let slug = slugify(name);
  let i = 2;
  while (await db.artist.findUnique({ where: { slug } })) slug = `${slugify(name)}-${i++}`;

  try {
    await db.artist.create({
      data: {
        name,
        slug,
        bio,
        image: image || null,
        country: country || null,
        foundedYear: foundedYearRaw ? Number(foundedYearRaw) || null : null,
        featured,
      },
    });
  } catch {
    return { error: "No se pudo crear el artista (¿nombre repetido?)." };
  }

  revalidatePath("/artistas");
  revalidatePath("/admin/artists");
  redirect("/admin/artists");
}

/* ---------- Buscar portada real ---------- */

export async function searchCoverAction(
  artist: string,
  title: string
): Promise<string | null> {
  if (!artist?.trim() || !title?.trim()) return null;
  return findCover(artist, title);
}
