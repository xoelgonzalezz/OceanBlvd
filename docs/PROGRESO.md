# Progreso del plan de mejora — Ocean Blvd Vinyl

Documento de seguimiento del `PLAN_OCEANBLVD.md`. Registra qué se ha verificado
contra el código real y qué se ha implementado en cada sprint.

---

## Verificación del diagnóstico (sección 1 del plan)

El diagnóstico se hizo sobre el HTML público y muchos puntos ya estaban
resueltos en el código. Resultado de la revisión del repo (Next.js 14 + Prisma +
Tailwind + Stripe):

| Punto del diagnóstico | Estado real en el repo | Acción |
|---|---|---|
| 1.1 Catálogo pequeño | Decisión de negocio (sección 8), no de código. Existe importador Discogs en `/admin/explorar` y stock/CSV. | Sin cambios de código |
| 1.2 Precios altos | Decisión de negocio. No tocar sin confirmar (regla del plan). | Sin cambios |
| 1.3 Cero canales / sin analytics | **Confirmado**: no había GA4, Meta Pixel, consent banner ni verificaciones. Sí existía analítica propia anónima (`/api/track`). Redes en footer via `SOCIAL_LINKS` (vacío). | **EPIC 1 hecho** |
| 1.4 Envío opaco | **Confirmado**: reglas de envío ya en `constants.ts` (4,99 € / gratis 60 €) pero no visibles antes del checkout. | **Banner de envío hecho** |
| 1.4 Métodos de pago no visibles | **Confirmado**: no había logos. | **PaymentMethods hecho** |
| 1.4 Sin WhatsApp | **Confirmado**. | **Botón flotante hecho** |
| 1.4 Imágenes hotlinkeadas | **Confirmado**: `next.config.mjs` permite cualquier host HTTPS; las imágenes se pegan como URL remota desde el admin. | **Script de self-host hecho** |
| 1.5 JSON-LD | **Ya existía y es completo**: `Product`+`Offer`+`shippingDetails`+`itemCondition`+`aggregateRating`+`BreadcrumbList`+`MerchantReturnPolicy` en ficha; `OnlineStore`+`WebSite`+`SearchAction` global; `Article`/`FAQ` en blog/faq. | Sin cambios (verificado ✔) |
| 1.5 sitemap.xml / robots.txt | **Ya existían** (`src/app/sitemap.ts`, `src/app/robots.ts`), dinámicos con el catálogo. | Sin cambios (verificado ✔) |
| 1.5 Toggle EN | **i18n real ya implementado** (cookie de locale, diccionario es/en, `<html lang>`). Falta `hreflang` si se quiere indexar EN. | Pendiente (EPIC 2) |
| 1.5 Meta keywords globales | Existen en `layout.tsx` (inertes). Baja prioridad. | Pendiente (EPIC 2) |
| 1.5 Landings limpias `/vinilos/...` | No existen; el catálogo vive en `/tienda?...`. | Pendiente (EPIC 2) |

**Conclusión:** el SEO técnico (EPIC 2) estaba mucho más avanzado de lo que
sugería el diagnóstico. El agujero real era **medición (EPIC 1)** y las
**fricciones de confianza (EPIC 3)**, que es justo lo que ataca el Sprint 1.

---

## Sprint 1 — Medición + confianza + self-host de imágenes

### EPIC 1 — Medición y visibilidad
- [x] **GA4** con eventos ecommerce (`view_item`, `add_to_cart`, `begin_checkout`, `purchase`). Se carga solo tras consentimiento. (`src/lib/analytics.ts`, `src/components/analytics/analytics.tsx`)
- [x] **Consent banner (CMP)** con Consent Mode v2. Ningún script de terceros se descarga antes de aceptar. Enlaza a `/legal/cookies`.
- [x] **Meta Pixel** (retargeting / catálogo Instagram), también tras consentimiento.
- [x] **Verificación Google Search Console** por meta etiqueta (`NEXT_PUBLIC_GSC_VERIFICATION`).
- [x] **Verificación de dominio de Meta** por meta etiqueta (`NEXT_PUBLIC_META_DOMAIN_VERIFICATION`).
- [x] `view_item_list` disponible como helper para listados (aún sin cablear en tarjetas).

### EPIC 3 — Conversión y confianza (parte del Sprint 1)
- [x] **Banner superior de envío** con coste, umbral gratis y plazo, visible en toda la tienda antes del checkout. (`AnnouncementBar`)
- [x] **Logos de métodos de pago** en el footer (Visa, Mastercard, PayPal, Apple Pay, Google Pay, Bizum). SVG en línea, sin recursos externos. (`PaymentMethods`)
- [x] **Botón flotante de WhatsApp** (aparece solo si `NEXT_PUBLIC_WHATSAPP_NUMBER` está configurado).

### EPIC 2 — SEO técnico (parte del Sprint 1)
- [x] **Script de self-host de imágenes**: descarga las imágenes remotas (Discogs, etc.) a `/public/products/`, las convierte a WebP y actualiza las URLs en la BD. Idempotente. (`scripts/self-host-images.ts`)

---

## Sprint 2 — Resto de SEO técnico (EPIC 2) + feeds (EPIC 5)

### EPIC 2 — SEO técnico
- [x] **Meta keywords globales eliminadas** (eran inertes; Google las ignora).
- [x] **Landings limpias indexables** con H1 propio y texto único (~120 palabras):
  - `/vinilos/nuevos` (condición NEW)
  - `/vinilos/segunda-mano` (condición USED, enlaza a estados/grading)
  - `/vinilos/[genero]` (una por género, texto propio o descripción del género)
  - Todas con `canonical` propia y añadidas al `sitemap.xml`.
- [x] **Canonical de parámetros**: ya existía (`/tienda` tiene canónica fija; los `?genre`/`?sort`/`?page` no compiten). Verificado ✔.
- [x] **`sizes` de imágenes** en las nuevas landings (evita servir el original enorme a tarjetas).
- [ ] `hreflang` / retirar toggle EN: **se mantiene** el i18n actual (funciona). Pendiente añadir `hreflang` si se decide indexar la versión EN (requiere URLs distintas por idioma; hoy es por cookie).

### EPIC 5 — Feeds para canales gratuitos
- [x] **Feed Google Merchant Center**: `/feeds/google-merchant.xml` (RSS 2.0 con `g:`). Incluye `condition` new/used, `availability`, `price`, `brand` (artista), `identifier_exists=no`, `google_product_category` de vinilos y `shipping` (ES). Caché 1 h.
- [x] **Feed catálogo de Meta**: `/feeds/meta-catalog.csv` para etiquetar productos en Instagram.
- [x] **RSS del blog**: `/feeds/blog.xml`.

---

## Pasos manuales pendientes (para Xoel)

Estos pasos NO son de código: hay que hacerlos en los paneles externos.

### Variables de entorno (Vercel → Settings → Environment Variables)
Copiar de `.env.example`. Todas son opcionales; si se dejan vacías, la función
correspondiente simplemente no aparece.

- `NEXT_PUBLIC_GA_ID` — ID de GA4 (`G-XXXXXXX`). Sin esto no hay banner de cookies.
- `NEXT_PUBLIC_META_PIXEL_ID` — ID del píxel de Meta.
- `NEXT_PUBLIC_GSC_VERIFICATION` — solo el `content` de la meta de Search Console.
- `NEXT_PUBLIC_META_DOMAIN_VERIFICATION` — solo el `content` de la meta de verificación de dominio de Meta.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — número internacional sin `+` ni espacios (p. ej. `34600112233`).

### Google Search Console
1. Alta de la propiedad (prefijo de URL `https://oceanblvdvinyl.com`).
2. Método "Etiqueta HTML" → copiar el valor `content` a `NEXT_PUBLIC_GSC_VERIFICATION` y desplegar.
3. Verificar. Después, **enviar el sitemap**: `https://oceanblvdvinyl.com/sitemap.xml`.

### Google Analytics 4
1. Crear propiedad GA4 y flujo de datos web → obtener el `G-XXXXXXX`.
2. Ponerlo en `NEXT_PUBLIC_GA_ID` y desplegar.
3. Comprobar en **GA4 → DebugView** que al hacer una compra de prueba aparece el
   evento `purchase` con `items` y `value` (acepta antes el banner de cookies).

### Meta (Facebook/Instagram)
1. Business Settings → Brand Safety → Domains → añadir dominio → copiar el
   `content` de la meta a `NEXT_PUBLIC_META_DOMAIN_VERIFICATION`.
2. Events Manager → crear píxel → copiar el ID a `NEXT_PUBLIC_META_PIXEL_ID`.

### Imágenes autoalojadas
Cuando haya imágenes remotas en el catálogo, ejecutar en local (con la BD de
producción en `.env`):

```bash
npx tsx scripts/self-host-images.ts --dry-run   # ver qué se descargaría
npx tsx scripts/self-host-images.ts             # descargar + actualizar BD
git add public/products && git commit -m "chore: self-host de imágenes"
```

Las imágenes quedan en `/public/products/` y hay que commitearlas para que
Vercel las sirva.

### Google Merchant Center (fichas gratuitas de Shopping)
1. Alta en Merchant Center y verificar el dominio (lo enlaza con Search Console).
2. Productos → Fuentes de datos → añadir feed programado con la URL
   `https://oceanblvdvinyl.com/feeds/google-merchant.xml` (frecuencia diaria).
3. Configurar el envío en la cuenta (envío gratis desde 60 € no cabe en el feed;
   se define como regla de cuenta). Activar las **fichas gratuitas** (no requiere ads).
4. Vincular GA4 desde Merchant Center para ver conversiones.

### Catálogo de Meta (Instagram Shopping)
1. Commerce Manager → Catálogo → añadir fuente de datos → feed de datos.
2. URL: `https://oceanblvdvinyl.com/feeds/meta-catalog.csv` (programado diario).

### Bizum (opcional, alta conversión en España)
Stripe no ofrece Bizum de forma nativa en España. Para aceptarlo hace falta una
pasarela tipo **MONEI** o **Redsys**. El logo de Bizum ya está en el footer; si
finalmente no se integra, quitarlo de `PaymentMethods`.

---

## Backlog restante por epics (resumen)

- **EPIC 2**: pendiente solo `hreflang` (o retirar toggle EN) — decisión abierta.
- **EPIC 3 (resto)**: barra de progreso a envío gratis en carrito; reviews sin login / post-compra; galería multi-imagen 2ª mano; `/grading`; back-in-stock; wishlist; newsletter con cupón; recuperación de carrito.
- **EPIC 4**: preventas (estado `preorder` + `/preventas`); colecciones/tags administrables; campos `gtin`/`peso`/`discogs_release_id`.
- **EPIC 5**: hecho (feeds Merchant/Meta + RSS blog). Pendiente solo el alta manual en los paneles.
- **EPIC 6**: páginas de artista enriquecidas; plantilla de blog + 10 borradores; "Vende tus vinilos".
- **EPIC 7**: auditoría Lighthouse; 404 con buscador; tests de sitemap/JSON-LD/feed.
