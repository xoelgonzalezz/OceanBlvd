"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/lib/db";
import { TAGS } from "@/lib/queries";
import { DEFAULT_CARRIER } from "@/lib/constants";
import { sendShippingNotification } from "@/lib/email";
import { slugify, decadeOf } from "@/lib/utils";
import { findCover } from "@/lib/cover-search";
import {
  ADMIN_COOKIE,
  checkAdminPassword,
  createAdminToken,
  isAdminRequest,
} from "@/lib/admin-token";
import { rateLimit } from "@/lib/rate-limit";

function clientIp(): string {
  const h = headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local"
  );
}

/** Acepta solo rutas locales o URLs http(s); descarta javascript:/data:/etc. */
function safeImageUrl(raw: string): string {
  const u = (raw || "").trim();
  if (!u) return "";
  if (u.startsWith("/")) return u;
  return /^https?:\/\//i.test(u) ? u : "";
}

export interface ActionState {
  error?: string;
}

/* ---------- Autenticación ---------- */

/** Destino interno seguro dentro del panel: empieza por "/admin", sin "//", "://" ni "\". */
function safeAdminFrom(raw: string | null | undefined): string {
  const v = (raw || "").trim();
  if (
    v.startsWith("/admin") &&
    !v.startsWith("//") &&
    !v.includes("://") &&
    !v.includes("\\")
  ) {
    return v;
  }
  return "/admin";
}

/**
 * Lee el `from` con el que el middleware redirigió a /admin/login. El formulario
 * lo incluye como campo oculto; si no llega, se intenta deducir del Referer.
 */
function loginFrom(formData: FormData): string {
  const field = formData.get("from");
  if (typeof field === "string" && field) return safeAdminFrom(field);
  const ref = headers().get("referer");
  if (ref) {
    try {
      return safeAdminFrom(new URL(ref).searchParams.get("from"));
    } catch {
      /* referer no parseable */
    }
  }
  return "/admin";
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!rateLimit(`admin-login:${clientIp()}`, 5, 60_000)) {
    return { error: "Demasiados intentos. Espera un minuto." };
  }
  const password = String(formData.get("password") || "");
  if (!checkAdminPassword(password)) {
    return { error: "Contraseña incorrecta." };
  }
  const dest = loginFrom(formData);
  cookies().set(ADMIN_COOKIE, await createAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  redirect(dest);
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
  revalidateTag(TAGS.records);
  revalidateTag(TAGS.genres);
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
        color: string | null;
        colorEn: string | null;
        vinylImage: string | null;
        vinylSpin: boolean;
        stock: number;
        description: string;
        descriptionEn: string | null;
        featured: boolean;
      };
      tracks: { position: number; title: string; duration: string | null }[];
      coverUrl: string;
      image2Url: string;
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
  const color = String(formData.get("color") || "").trim();
  const colorEn = String(formData.get("colorEn") || "").trim();
  const vinylImage = safeImageUrl(String(formData.get("vinylImage") || ""));
  // Modo de visualización del vinilo: "still" = imagen normal; cualquier otro = gira.
  const vinylSpin = String(formData.get("vinylSpin") || "spin") !== "still";
  const stock = Number(formData.get("stock")) || 1;
  const description = String(formData.get("description") || "").trim();
  const descriptionEn = String(formData.get("descriptionEn") || "").trim();
  const featured = formData.get("featured") === "on";
  const coverUrl = safeImageUrl(String(formData.get("coverUrl") || ""));
  // Segunda foto (opcional), p. ej. el vinilo, para la galería del producto.
  const image2Url = safeImageUrl(String(formData.get("image2") || ""));
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
      color: color || null,
      colorEn: colorEn || null,
      vinylImage: vinylImage || null,
      vinylSpin,
      stock: Math.max(0, stock),
      description,
      descriptionEn: descriptionEn || null,
      featured,
    },
    tracks: parseTracks(tracksText),
    coverUrl,
    image2Url,
  };
}

/** Construye las imágenes del disco: portada (pos. 0) y 2ª foto opcional (pos. 1). */
function buildRecordImages(
  parsed: { coverUrl: string; image2Url: string; data: { title: string } },
  artistName: string
) {
  const images = [
    {
      url: parsed.coverUrl || "/placeholders/cover-01.svg",
      alt: `Portada de ${parsed.data.title} de ${artistName}`,
      position: 0,
    },
  ];
  if (parsed.image2Url) {
    images.push({
      url: parsed.image2Url,
      alt: `${parsed.data.title} de ${artistName} — vinilo`,
      position: 1,
    });
  }
  return images;
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
  if (!(await isAdminRequest())) return { error: "No autorizado." };
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
        images: { create: buildRecordImages(parsed, artist.name) },
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
  if (!(await isAdminRequest())) return { error: "No autorizado." };
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
          images: { create: buildRecordImages(parsed, artist.name) },
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
  if (!(await isAdminRequest())) return;
  const id = String(formData.get("id") || "");
  if (!id) return;

  // Si el disco ya se ha vendido alguna vez, borrarlo rompería el historial de
  // pedidos: lo archivamos (desaparece de la tienda y del panel). Si no tiene
  // ventas, se borra de verdad.
  const sold = await db.orderItem.findFirst({
    where: { recordId: id },
    select: { id: true },
  });

  let msg = "record-deleted";
  if (sold) {
    await db.record.update({ where: { id }, data: { archived: true } });
    msg = "record-archived";
  } else {
    try {
      await db.record.delete({ where: { id } });
    } catch {
      msg = "record-error";
    }
  }

  revalidateShop();
  redirect(`/admin?msg=${msg}`);
}

/* ---------- CRUD de artistas ---------- */

function parseArtistForm(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const bio = String(formData.get("bio") || "").trim();
  const bioEn = String(formData.get("bioEn") || "").trim();
  const image = safeImageUrl(String(formData.get("image") || ""));
  const country = String(formData.get("country") || "").trim();
  const foundedYearRaw = formData.get("foundedYear");
  const featured = formData.get("featured") === "on";
  if (!name) return { error: "El nombre es obligatorio." } as const;
  if (!bio) return { error: "Añade una biografía." } as const;
  return {
    data: {
      name,
      bio,
      bioEn: bioEn || null,
      image: image || null,
      country: country || null,
      foundedYear: foundedYearRaw ? Number(foundedYearRaw) || null : null,
      featured,
    },
  } as const;
}

export async function createArtistAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdminRequest())) return { error: "No autorizado." };
  const parsed = parseArtistForm(formData);
  if ("error" in parsed) return parsed;

  let slug = slugify(parsed.data.name);
  let i = 2;
  while (await db.artist.findUnique({ where: { slug } }))
    slug = `${slugify(parsed.data.name)}-${i++}`;

  try {
    await db.artist.create({ data: { ...parsed.data, slug } });
  } catch {
    return { error: "No se pudo crear el artista (¿nombre repetido?)." };
  }

  revalidatePath("/artistas");
  revalidatePath("/admin/artists");
  revalidateTag(TAGS.artists);
  revalidateTag(TAGS.records);
  redirect("/admin/artists");
}

export async function updateArtistAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdminRequest())) return { error: "No autorizado." };
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Falta el identificador." };
  const parsed = parseArtistForm(formData);
  if ("error" in parsed) return parsed;

  const existing = await db.artist.findUnique({ where: { id } });
  if (!existing) return { error: "El artista no existe." };

  try {
    await db.artist.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "No se pudo guardar el artista (¿nombre repetido?)." };
  }

  revalidatePath("/artistas");
  revalidatePath(`/artistas/${existing.slug}`);
  revalidatePath("/admin/artists");
  revalidateTag(TAGS.artists);
  revalidateTag(TAGS.records);
  redirect("/admin/artists");
}

export async function deleteArtistAction(formData: FormData) {
  if (!(await isAdminRequest())) return;
  const id = String(formData.get("id") || "");
  if (!id) return;

  // ¿Tiene algún disco con ventas? Entonces no se puede borrar sin romper el
  // historial: archivamos el artista y todos sus discos. Si no hay ventas, se
  // borra de verdad (sus discos se eliminan en cascada).
  const sold = await db.orderItem.findFirst({
    where: { record: { artistId: id } },
    select: { id: true },
  });

  let msg = "artist-deleted";
  if (sold) {
    await db.$transaction([
      db.record.updateMany({ where: { artistId: id }, data: { archived: true } }),
      db.artist.update({ where: { id }, data: { archived: true } }),
    ]);
    msg = "artist-archived";
  } else {
    try {
      await db.artist.delete({ where: { id } });
    } catch {
      msg = "artist-error";
    }
  }

  revalidatePath("/artistas");
  revalidatePath("/admin/artists");
  revalidateTag(TAGS.artists);
  revalidateTag(TAGS.records);
  revalidatePath("/admin");
  redirect(`/admin/artists?msg=${msg}`);
}

/* ---------- CRUD del blog ---------- */

function parseBlogForm(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const titleEn = String(formData.get("titleEn") || "").trim();
  const excerpt = String(formData.get("excerpt") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const author = String(formData.get("author") || "").trim();
  const tag = String(formData.get("tag") || "").trim();
  const coverImage = safeImageUrl(String(formData.get("coverImage") || ""));
  const excerptEn = String(formData.get("excerptEn") || "").trim();
  const contentEn = String(formData.get("contentEn") || "").trim();
  if (!title) return { error: "El título es obligatorio." } as const;
  if (!excerpt) return { error: "Añade un extracto." } as const;
  if (!content) return { error: "Añade el contenido." } as const;
  if (!author) return { error: "Indica el autor." } as const;
  return {
    data: {
      title,
      titleEn: titleEn || null,
      excerpt,
      content,
      author,
      tag: tag || null,
      coverImage: coverImage || null,
      excerptEn: excerptEn || null,
      contentEn: contentEn || null,
    },
  } as const;
}

export async function createBlogAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdminRequest())) return { error: "No autorizado." };
  const parsed = parseBlogForm(formData);
  if ("error" in parsed) return parsed;

  let slug = slugify(parsed.data.title);
  let i = 2;
  while (await db.blogPost.findUnique({ where: { slug } }))
    slug = `${slugify(parsed.data.title)}-${i++}`;

  try {
    await db.blogPost.create({ data: { ...parsed.data, slug } });
  } catch {
    return { error: "No se pudo crear el artículo." };
  }

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidateTag(TAGS.blog);
  redirect("/admin/blog");
}

export async function updateBlogAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdminRequest())) return { error: "No autorizado." };
  const id = String(formData.get("id") || "");
  if (!id) return { error: "Falta el identificador." };
  const parsed = parseBlogForm(formData);
  if ("error" in parsed) return parsed;

  const existing = await db.blogPost.findUnique({ where: { id } });
  if (!existing) return { error: "El artículo no existe." };

  try {
    await db.blogPost.update({ where: { id }, data: parsed.data });
  } catch {
    return { error: "No se pudo guardar el artículo." };
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath("/admin/blog");
  revalidateTag(TAGS.blog);
  redirect("/admin/blog");
}

export async function deleteBlogAction(formData: FormData) {
  if (!(await isAdminRequest())) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  try {
    await db.blogPost.delete({ where: { id } });
  } catch {
    /* ignore */
  }
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  revalidateTag(TAGS.blog);
  redirect("/admin/blog");
}

/* ---------- Usuarios ---------- */

export async function deleteUserAction(formData: FormData) {
  if (!(await isAdminRequest())) return;
  const id = String(formData.get("id") || "");
  if (!id) return;
  try {
    // Las reseñas se borran en cascada; los pedidos se desvinculan (userId = null).
    await db.user.delete({ where: { id } });
  } catch {
    /* ignore */
  }
  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

/* ---------- Pedidos / envíos ---------- */

/**
 * Marca un pedido como ENVIADO, guarda el localizador de Correos y avisa al
 * comprador por email con el enlace de seguimiento.
 */
export async function markOrderShippedAction(formData: FormData) {
  if (!(await isAdminRequest())) return;
  const id = String(formData.get("id") || "");
  const trackingNumber = String(formData.get("trackingNumber") || "").trim();
  if (!id) return;
  if (!trackingNumber) {
    redirect("/admin/pedidos?msg=tracking-required");
  }

  const order = await db.order.findUnique({
    where: { id },
    select: { id: true, status: true },
  });
  if (!order) {
    redirect("/admin/pedidos?msg=order-missing");
  }
  // Solo se envía lo que está pagado (o ya enviado, para corregir el localizador).
  if (order.status !== "PAID" && order.status !== "SHIPPED") {
    redirect("/admin/pedidos?msg=order-not-payable");
  }

  await db.order.update({
    where: { id },
    data: {
      status: "SHIPPED",
      carrier: DEFAULT_CARRIER,
      trackingNumber,
      shippedAt: new Date(),
    },
  });

  // Email al comprador (no bloquea: sendMail nunca lanza).
  await sendShippingNotification(id);

  revalidatePath("/admin/pedidos");
  revalidatePath("/cuenta");
  redirect("/admin/pedidos?msg=order-shipped");
}

/**
 * Borra un pedido de forma definitiva. Por ser una acción irreversible, exige
 * volver a escribir la contraseña de admin (re-autenticación), además de la
 * sesión ya activa. Las líneas del pedido se borran en cascada.
 */
export async function deleteOrderAction(formData: FormData) {
  if (!(await isAdminRequest())) return;
  const id = String(formData.get("id") || "");
  const password = String(formData.get("password") || "");
  if (!id) return;

  // Límite de intentos por IP para que el campo de contraseña no sea un oráculo.
  if (!rateLimit(`order-delete:${clientIp()}`, 10, 60_000)) {
    redirect("/admin/pedidos?msg=order-delete-throttled");
  }
  if (!checkAdminPassword(password)) {
    redirect("/admin/pedidos?msg=order-delete-badpass");
  }

  try {
    await db.order.delete({ where: { id } });
  } catch {
    redirect("/admin/pedidos?msg=order-missing");
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/cuenta");
  redirect("/admin/pedidos?msg=order-deleted");
}

/* ---------- Buscar portada real ---------- */

export async function searchCoverAction(
  artist: string,
  title: string
): Promise<string | null> {
  if (!(await isAdminRequest())) return null;
  if (!rateLimit(`cover-search:${clientIp()}`, 20, 60_000)) return null;
  if (!artist?.trim() || !title?.trim()) return null;
  return findCover(artist, String(title).slice(0, 200));
}
