# Ocean Blvd Vinyl

![Ocean Blvd Vinyl](public/og-default.png)

Tienda de comercio electrónico de **discos de vinilo**, moderna y muy cuidada. Estética **blanco y negro** de alto contraste (inspirada en tiendas de coleccionista tipo *Vertigo Vinyl*), **modo oscuro por defecto** con toggle, micro-interacciones y dinamismo (filosofía de animación de Emil Kowalski), **imágenes reales** de portadas y artistas, **panel de administración** y datos de ejemplo realistas.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8)

---

## ✨ Funcionalidades

### Tienda (storefront)
- **Inicio** con hero (vinilo girando + edición exclusiva de Lana Del Rey), marquesina, últimas novedades, géneros, más vendidos, artistas destacados y avance del blog.
- **Catálogo** con filtros (género, artista, década, rango de precio, estado), ordenación (novedad, más vendidos, precio, A–Z), buscador y paginación — **todo sincronizado con la URL**.
- **Ficha de producto** con galería, tracklist completo, sello, año, género, estado (Mint, VG+…), descripción y **productos relacionados**.
- **Carrito** persistente (Zustand + `localStorage`) con cajón lateral y **checkout** con cálculo de envío y **pago simulado** que crea un pedido real, **descuenta stock** e incrementa ventas.
- **Artistas** (listado + ficha con biografía, foto real y discografía).
- **Blog / Noticias** (listado + artículo) con **fotos reales**.
- **Páginas estáticas**: Sobre nosotros, Contacto (formulario), FAQ y Política de envíos.
- **Buscador global** tipo command palette (`⌘K` / `Ctrl+K`).
- **Bilingüe ES/EN**: toggle de idioma; interfaz y contenido (bios, descripciones, artículos) traducidos.

### Cuentas de cliente
- **Registro e inicio de sesión** reales: modelo `User`, contraseñas con **bcrypt**, sesión por cookie firmada.
- **Área de cuenta** (`/cuenta`) con datos del usuario y su **historial de pedidos** (los pedidos se vinculan a la cuenta al hacer checkout con sesión iniciada).

### Panel de administración (`/admin`)
- Acceso protegido por **contraseña** (`ADMIN_PASSWORD`) con cookie firmada y middleware.
- **CRUD completo de vinilos**: crear, editar y eliminar con precio, estado, stock, descripción (ES/EN) y tracklist.
- **Buscador automático de portada real** (por artista + título, vía iTunes/Deezer) o pegando una URL.
- **CRUD de artistas**: crear, editar y eliminar (bio ES/EN, foto, país, año, destacado).
- **CRUD del blog**: crear, editar y eliminar artículos (ES/EN, autor, categoría, portada).
- En resumen: **toda la información visible de la web se gestiona desde `/admin`**.

### Diseño y calidad
- **Blanco y negro** monocromo, alto contraste, tipografía *Fraunces* (serif) + *Inter*.
- **Modo claro/oscuro** (oscuro por defecto), **100% responsive** (móvil, tablet, escritorio).
- **SEO**: metadatos por página, Open Graph (imagen PNG 1200×630), `sitemap.xml`, `robots.txt` y **datos estructurados JSON-LD** (Product, BlogPosting, FAQPage, BreadcrumbList, Organization, WebSite).
- **Accesibilidad**: HTML semántico, `alt`, `aria-label`, foco visible, `prefers-reduced-motion`, objetivos táctiles y `text-base` en formularios (evita el zoom de iOS).

---

## 🧱 Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui (Radix UI) |
| Base de datos | SQLite + Prisma (migrable a PostgreSQL) |
| Estado del carrito | Zustand (con persistencia) |
| Animación | CSS + IntersectionObserver (curvas de easing a medida) |
| Imágenes | next/image + Sharp · portadas y fotos reales auto-alojadas en `/public` |
| Validación | Zod · Iconos: lucide-react · Toasts: Sonner |

---

## 🚀 Puesta en marcha (local)

Requisitos: **Node.js 18.18+**, npm y una base de datos **PostgreSQL** (p. ej. [Neon](https://neon.tech), plan gratuito).

```bash
npm install
cp .env.example .env          # Windows (PowerShell): copy .env.example .env
# Edita .env y pon tu DATABASE_URL de PostgreSQL (Neon) y ADMIN_PASSWORD
npm run db:push               # crea las tablas
npm run db:seed               # carga datos realistas
npm run dev                   # http://localhost:3000
```

- **Tienda:** http://localhost:3000
- **Admin:** http://localhost:3000/admin — contraseña por defecto `oceanblvd` (cámbiala en `.env`).

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
| `npm run db:studio` | Prisma Studio |

---

## 🖼️ Imágenes reales

Las portadas (iTunes/Deezer, coincidencia exacta de título), las **fotos profesionales de artista** (Deezer) y las fotos editoriales del blog (Openverse) se **descargaron y optimizaron a `/public`** (`/covers`, `/artists`, `/blog`). Así la app no depende de CDNs externos en tiempo de ejecución ni sufre límites de tasa. Para usar tus propias fotos, sustituye los archivos o, desde el panel admin, pega/busca una URL.

---

## ☁️ Desplegar en producción (Vercel + Neon)

La app ya usa **PostgreSQL** (Prisma `provider = "postgresql"`), lista para *serverless*. La base de datos Neon ya está creada y sembrada. Pasos para publicarla en Vercel:

1. Entra en **[vercel.com/new](https://vercel.com/new)** e importa el repo de GitHub `xoelgonzalezz/OceanBlvd`.
2. Añade las **variables de entorno** (Settings → Environment Variables):
   - `DATABASE_URL` → tu *connection string* de Neon (`postgresql://…`).
   - `ADMIN_PASSWORD` → una contraseña segura para el panel `/admin`.
   - `NEXT_PUBLIC_SITE_URL` → la URL pública (p. ej. `https://oceanblvd.vercel.app`).
3. Pulsa **Deploy**. Cada `git push` a `main` redeplega automáticamente.

> La base de datos ya está poblada. Para reinicializarla: con `DATABASE_URL` apuntando a Neon, `npm run db:push && npm run db:seed`.

---

## 🗺️ Próximos pasos (roadmap)

- [x] Autenticación de clientes y área "Mis pedidos".
- [x] CRUD completo desde el admin (vinilos, artistas, blog).
- [x] Bilingüe ES/EN.
- [ ] Pasarela de pago real (Stripe Checkout).
- [ ] Reseñas y valoraciones de discos.
- [ ] Subida de imágenes en el admin (Vercel Blob) en vez de URL.
- [ ] Wishlist y recomendaciones.
- [ ] Tests (unitarios + e2e) y CI.

---

Hecho con cariño por la música.
