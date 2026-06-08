# Ocean Blvd Vinyl

![Ocean Blvd Vinyl](public/og-default.png)

Tienda de comercio electrónico de **discos de vinilo**, completa y lista para producción. Estética **blanco y negro** de alto contraste (inspirada en tiendas de coleccionista tipo *Vertigo Vinyl*), **modo oscuro por defecto** con toggle, micro-interacciones y dinamismo (filosofía de animación de Emil Kowalski), **imágenes reales** de portadas y artistas, **cuentas de cliente**, **reseñas**, **pago real con Stripe**, **email de confirmación**, **panel de administración** completo y **bilingüe ES/EN**.

🔗 **En vivo:** **https://ocean-blvd-vinyl.vercel.app**

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8) ![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF)

| | |
|---|---|
| 🛍️ Tienda | https://ocean-blvd-vinyl.vercel.app |
| 🔐 Admin | https://ocean-blvd-vinyl.vercel.app/admin — contraseña por defecto `oceanblvd` |
| 👤 Cuenta | `/registro` y `/acceso` |

---

## 📑 Índice

1. [Funcionalidades](#-funcionalidades)
2. [Stack](#-stack)
3. [Estructura del proyecto](#-estructura-del-proyecto)
4. [Esquema de base de datos](#-esquema-de-base-de-datos)
5. [Puesta en marcha (local)](#-puesta-en-marcha-local)
6. [Variables de entorno](#-variables-de-entorno)
7. [Scripts](#-scripts)
8. [Internacionalización (ES/EN)](#-internacionalización-esen)
9. [Imágenes reales](#-imágenes-reales)
10. [Panel de administración](#-panel-de-administración)
11. [Pagos con Stripe](#-pagos-con-stripe)
12. [Email de confirmación (Resend)](#-email-de-confirmación-resend)
13. [Despliegue (Vercel + Neon)](#-despliegue-vercel--neon)
14. [Rendimiento](#-rendimiento)
15. [Seguridad](#-seguridad)
16. [Mejora continua automatizada](#-mejora-continua-automatizada)
17. [Roadmap](#-roadmap)

---

## ✨ Funcionalidades

### Tienda (storefront)
- **Inicio** con hero (vinilo verde de edición exclusiva girando + portada de Lana Del Rey), marquesina, últimas novedades, géneros, más vendidos, artistas destacados y avance del blog.
- **Catálogo** con filtros (género, artista, década, rango de precio, estado), ordenación (novedad, más vendidos, precio, A–Z), buscador y paginación — **todo sincronizado con la URL**.
- **Ficha de producto** con galería, tracklist completo, sello, año, género, estado (Mint, VG+…), descripción, enlace al artista, **valoraciones (1–5 estrellas + reseñas)** y **productos relacionados**.
- **Carrito** persistente (Zustand + `localStorage`) con cajón lateral y **checkout** con cálculo de envío (gratis a partir de 60 €).
- **Artistas** (listado + ficha con biografía, foto real y discografía).
- **Blog / Noticias** (listado + artículo) con **fotos reales**.
- **Páginas estáticas**: Sobre nosotros, Contacto (formulario), FAQ y Política de envíos.
- **Buscador global** tipo command palette (`⌘K` / `Ctrl+K`).
- **Bilingüe ES/EN** con toggle en la cabecera.

### Cuentas de cliente
- **Registro e inicio de sesión** reales: modelo `User`, contraseñas con **bcrypt**, sesión por cookie firmada (HMAC + expiración).
- **Área de cuenta** (`/cuenta`) con datos del usuario y su **historial de pedidos** (los pedidos se vinculan a la cuenta al hacer checkout con sesión iniciada).

### Reseñas y valoraciones
- Los usuarios registrados puntúan (1–5 estrellas) y comentan cada disco.
- Media con estrellas y listado de reseñas en la ficha; una reseña por usuario y disco (editable/eliminable por su autor).

### Pagos y pedidos
- **Pago real con Stripe Checkout** (con *fallback* a pago simulado si no hay claves configuradas).
- El **webhook** confirma el pago, marca el pedido como `PAID`, **descuenta stock** e incrementa ventas.
- **Email de confirmación** de pedido con plantilla blanco y negro acorde a la web (vía Resend).
- Totales recalculados **siempre en el servidor** (no se confía en el cliente).

### Panel de administración (`/admin`)
- Acceso protegido por **contraseña** (`ADMIN_PASSWORD`) con cookie firmada y middleware.
- **CRUD completo de vinilos**: crear, editar y eliminar con precio, estado, stock, descripción (ES/EN) y tracklist; **buscador automático de portada real** (por artista + título, vía iTunes/Deezer) o pegando una URL.
- **CRUD de artistas**: crear, editar y eliminar (bio ES/EN, foto, país, año, destacado).
- **CRUD del blog**: crear, editar y eliminar artículos (ES/EN, autor, categoría, portada).
- En resumen: **toda la información visible de la web se gestiona desde `/admin`**.

### Diseño y calidad
- **Blanco y negro** monocromo, alto contraste, tipografía *Fraunces* (serif) + *Inter*.
- **Modo claro/oscuro** (oscuro por defecto), **100% responsive** (móvil, tablet, escritorio).
- **SEO**: metadatos por página, Open Graph (PNG 1200×630), `sitemap.xml`, `robots.txt` y **JSON-LD** (Product, BlogPosting, FAQPage, BreadcrumbList, Organization, WebSite).
- **Accesibilidad**: HTML semántico, `alt`, `aria-label`, foco visible, `prefers-reduced-motion`, objetivos táctiles y `text-base` en formularios (evita el zoom de iOS).

---

## 🧱 Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui (Radix UI) |
| Base de datos | PostgreSQL ([Neon](https://neon.tech)) + Prisma 5 |
| Estado del carrito | Zustand (persistido en `localStorage`) |
| Autenticación | bcryptjs + cookies firmadas (HMAC, Web Crypto) |
| Pagos | Stripe Checkout + webhook |
| Email | Resend (API HTTP) |
| Animación | CSS + IntersectionObserver (curvas de easing a medida) |
| Imágenes | next/image + Sharp · portadas y fotos reales auto-alojadas en `/public` |
| Validación | Zod · Iconos: lucide-react · Toasts: Sonner |
| Hosting | Vercel (región `lhr1`, junto a Neon `eu-west-2`) |

---

## 📂 Estructura del proyecto

```
src/
├── app/
│   ├── (shop)/                  # Grupo con cabecera + pie
│   │   ├── page.tsx             # Inicio
│   │   ├── tienda/              # Catálogo (filtros, orden, búsqueda)
│   │   ├── producto/[slug]/     # Ficha + reseñas (review-actions.ts)
│   │   ├── artistas/[slug]/     # Listado y ficha de artista
│   │   ├── blog/[slug]/         # Listado y artículo
│   │   ├── carrito/ · checkout/ # Carrito y checkout (+ /checkout/exito)
│   │   ├── cuenta/              # Área de cuenta + actions de auth
│   │   ├── acceso/ · registro/  # Login y registro
│   │   └── sobre-nosotros · contacto · faq · envios
│   ├── admin/                   # Panel: dashboard, records, artists, blog, login + actions.ts
│   ├── api/                     # checkout, stripe/webhook, contact, newsletter, search
│   ├── layout.tsx · sitemap.ts · robots.ts · not-found.tsx
│   └── globals.css              # Tokens de diseño (B&N) + utilidades
├── components/                  # ui (shadcn), layout, home, shop, product, cart,
│                                # checkout, account, reviews, admin, shared, i18n
├── lib/                         # db, queries (cacheadas), auth/, stripe, email,
│                                # cover-search, rate-limit, validators, constants, utils
├── store/cart.ts                # Estado del carrito (Zustand)
├── i18n/                        # dictionary.ts (ES/EN), server.ts (locale por cookie)
├── types/ · middleware.ts       # Tipos + protección de /admin
prisma/
├── schema.prisma · seed.ts · seed-data.json
public/  covers/ · artists/ · blog/ · placeholders/   # imágenes reales optimizadas
```

---

## 🗄️ Esquema de base de datos

Modelos Prisma (PostgreSQL):

| Modelo | Descripción |
|--------|-------------|
| `Genre` | Género musical (slug, nombre, descripción). |
| `Artist` | Artista (bio ES/EN, foto, país, año, destacado). |
| `Record` | Disco/vinilo: título, sello, año, década, **precio en céntimos**, estado (`NEW`/`USED`), grado (M/NM/VG+…), stock, ventas, destacado, descripción ES/EN. |
| `RecordImage` | Imágenes del disco (portada…). |
| `Track` | Pista del tracklist (posición, título, duración). |
| `BlogPost` | Artículo (slug, extracto/contenido ES/EN, autor, categoría, portada). |
| `User` | Cuenta de cliente (email, nombre, `passwordHash`). |
| `Review` | Valoración (1–5 + comentario) — única por usuario y disco. |
| `Order` | Pedido (datos de envío, totales en céntimos, estado, `accessToken` para acceso seguro a la confirmación, `userId` opcional). |
| `OrderItem` | Línea de pedido (cantidad, precio en el momento de la compra). |
| `NewsletterSubscriber` · `ContactMessage` | Newsletter del pie y formulario de contacto. |

> Los **precios se guardan en céntimos** (`Int`) para evitar errores de coma flotante y se formatean en la UI.

---

## 🚀 Puesta en marcha (local)

Requisitos: **Node.js 18.18+**, npm y una base de datos **PostgreSQL** (p. ej. [Neon](https://neon.tech), plan gratuito).

```bash
git clone https://github.com/xoelgonzalezz/OceanBlvd.git
cd OceanBlvd
npm install
cp .env.example .env          # Windows (PowerShell): copy .env.example .env
# Edita .env (mínimo: DATABASE_URL, ADMIN_PASSWORD, AUTH_SECRET)
npm run db:push               # crea las tablas en tu base de datos
npm run db:seed               # carga datos realistas (géneros, artistas, discos, blog)
npm run dev                   # http://localhost:3000
```

- **Tienda:** http://localhost:3000
- **Admin:** http://localhost:3000/admin — contraseña la de `ADMIN_PASSWORD` (por defecto `oceanblvd`).

---

## 🔐 Variables de entorno

Copia `.env.example` a `.env`. Mínimas para arrancar en negrita; el resto activan funciones opcionales.

| Variable | Obligatoria | Descripción |
|----------|:-----------:|-------------|
| **`DATABASE_URL`** | ✅ | Cadena de conexión PostgreSQL (Neon). |
| **`ADMIN_PASSWORD`** | ✅ | Contraseña del panel `/admin`. **Sin valor por defecto en producción.** |
| **`AUTH_SECRET`** | ✅ (prod) | Cadena larga y aleatoria para firmar sesiones (usuario y admin). |
| `NEXT_PUBLIC_SITE_URL` | recomendada | URL pública (para SEO/OG/links de email). |
| `STRIPE_SECRET_KEY` | opcional | `sk_test_…`/`sk_live_…`. Sin ella, el pago es **simulado**. |
| `STRIPE_WEBHOOK_SECRET` | opcional | `whsec_…` del webhook `checkout.session.completed`. |
| `RESEND_API_KEY` | opcional | `re_…`. Sin ella, **no se envían** emails (no rompe el pedido). |
| `EMAIL_FROM` | opcional | Remitente (por defecto `Ocean Blvd Vinyl <onboarding@resend.dev>`). |

Genera un `AUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📜 Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (`prisma generate` + `next build`) |
| `npm run start` | Servir el build |
| `npm run db:push` | Sincroniza el esquema con la base de datos |
| `npm run db:seed` | Carga los datos de ejemplo |
| `npm run db:reset` | Reinicia la base de datos y la vuelve a sembrar |
| `npm run db:studio` | Prisma Studio (explorar la base de datos) |
| `npm run lint` | ESLint |

---

## 🌍 Internacionalización (ES/EN)

- Diccionario tipado en `src/i18n/dictionary.ts` (todas las cadenas de la interfaz).
- El idioma se guarda en una **cookie** y se cambia con el toggle de la cabecera.
- El contenido de la base de datos (bios, descripciones, artículos) tiene campos **ES y EN** editables desde el admin.

---

## 🖼️ Imágenes reales

Las portadas (iTunes/Deezer, con coincidencia **exacta** de título), las **fotos profesionales de artista** (Deezer) y las fotos editoriales del blog (Wikimedia/Openverse) se **descargaron y optimizaron a `/public`** (`/covers`, `/artists`, `/blog`). Así la app no depende de CDNs externos en tiempo de ejecución ni sufre límites de tasa. Para usar tus propias fotos, sustituye los archivos o, desde el panel admin, pega/busca una URL.

---

## 🛠️ Panel de administración

`/admin` (contraseña = `ADMIN_PASSWORD`). Desde ahí:

- **Vinilos** → *Nuevo vinilo* / editar / eliminar. Botón **"Buscar portada real"** que rellena la imagen por artista + título.
- **Artistas** → crear/editar/eliminar (con bio ES/EN, foto, país, año, destacado).
- **Blog** → crear/editar/eliminar artículos (ES/EN, categoría, portada).

Los cambios invalidan la caché y se reflejan en la web al instante.

---

## 💳 Pagos con Stripe

1. En [dashboard.stripe.com](https://dashboard.stripe.com) (modo **Test**) → *Developers → API keys* → copia la **Secret key** (`sk_test_…`).
2. *Developers → Webhooks → Add endpoint*: URL `https://TU-DOMINIO/api/stripe/webhook`, evento **`checkout.session.completed`** → copia el **Signing secret** (`whsec_…`).
3. Define `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` (local en `.env`, en producción en Vercel) y redeplega.

**Probar:** en el checkout usa la tarjeta de test **`4242 4242 4242 4242`**, fecha futura, CVC y CP cualquiera. El pedido pasa a `PAID`, baja el stock y se envía el email.

> Sin `STRIPE_SECRET_KEY`, la pasarela queda **simulada** (crea el pedido directamente) para poder probar sin cuenta.

---

## 📧 Email de confirmación (Resend)

1. En [resend.com](https://resend.com) → *API Keys* → crea una clave (`re_…`) y ponla en `RESEND_API_KEY`.
2. Se envía un email con plantilla blanco y negro en cada pedido (checkout y webhook de Stripe).
3. **Para enviar a cualquier cliente** verifica un dominio en Resend (*Domains*) y pon `EMAIL_FROM="Ocean Blvd Vinyl <pedidos@tudominio.com>"`. Con el remitente por defecto `onboarding@resend.dev`, Resend solo entrega al correo de tu propia cuenta.

> Si no hay `RESEND_API_KEY`, el pedido se procesa igual pero no se envía email.

---

## ☁️ Despliegue (Vercel + Neon)

La app usa **PostgreSQL** (`provider = "postgresql"`), lista para *serverless*.

1. Importa el repo en **[vercel.com/new](https://vercel.com/new)**.
2. Añade las **variables de entorno** (Settings → Environment Variables): `DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` y, opcionalmente, las de Stripe y Resend.
3. **Deploy**. Conecta GitHub (*Settings → Git*) para redeploy automático en cada `git push` a `main`.
4. Inicializa la base de datos una vez: con `DATABASE_URL` apuntando a Neon, `npm run db:push && npm run db:seed`.

> **Región:** `vercel.json` fija las funciones en `lhr1` (Londres) para colocarlas junto a la base de datos Neon (`eu-west-2`) y minimizar latencia. Ajústalo a la región de tu base de datos.
>
> **Dominio propio:** añade el dominio en Vercel (Settings → Domains), apunta el DNS (registro `A` a `76.76.21.21` o los nameservers de Vercel) y pon `NEXT_PUBLIC_SITE_URL` al dominio nuevo.

---

## ⚡ Rendimiento

- Funciones de Vercel en **`lhr1`**, junto a la base de datos Neon → sin latencia transatlántica por consulta.
- Consultas de inicio, catálogo, fichas, artistas y blog **cacheadas** (`unstable_cache`) con **invalidación por etiquetas** (`records`, `artists`, `blog`, `genres`) desde el admin y el checkout.
- `next/image` + Sharp; imágenes auto-alojadas y optimizadas.

---

## 🛡️ Seguridad

- **Autenticación:** contraseñas con bcrypt; sesiones (usuario y admin) en cookies `httpOnly` con **token firmado HMAC + expiración** y comparación en **tiempo constante**. Secretos obligatorios en producción (sin *fallback*).
- **Autorización:** cada server action de admin verifica la sesión (no depende solo del middleware); la confirmación de pedido exige `accessToken` aleatorio o ser su dueño (anti-IDOR).
- **Cabeceras:** CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.
- **Entrada:** validación con Zod y límites de longitud/tamaño; `remotePatterns` de imágenes restringido a CDNs conocidos; JSON-LD escapado; URLs de admin saneadas.
- **Abuso:** rate-limiting en los logins; webhook de Stripe **verificado** y confirmando solo pagos `paid`.

---

## 🤖 Mejora continua automatizada

Hay una **rutina programada** (`ocean-blvd-mejora-semanal`) que, cada **lunes**, audita un área distinta (rendimiento → SEO → accesibilidad → seguridad → UX/diseño → calidad de código), aplica mejoras seguras, verifica el `build` y **abre una Pull Request** para revisión humana. Nunca toca `main` ni producción sin aprobación. Se gestiona desde el panel **"Scheduled"** de Claude Code.

---

## 🗺️ Roadmap

- [x] Tienda completa (catálogo, ficha, carrito, checkout).
- [x] Cuentas de cliente y área "Mis pedidos".
- [x] CRUD completo desde el admin (vinilos, artistas, blog).
- [x] Reseñas y valoraciones.
- [x] Pago real con Stripe + webhook + email de confirmación.
- [x] Bilingüe ES/EN.
- [x] Desplegado en Vercel + Neon (Postgres), optimizado y endurecido.
- [x] Mejora continua semanal vía PR.
- [ ] Subida de imágenes en el admin (Vercel Blob) en vez de URL.
- [ ] Wishlist y recomendaciones.
- [ ] Tests (unitarios + e2e) y CI.

---

Hecho con cariño por la música.
