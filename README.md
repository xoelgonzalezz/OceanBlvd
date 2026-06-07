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

### Panel de administración (`/admin`)
- Acceso protegido por **contraseña** (`ADMIN_PASSWORD`) con cookie firmada y middleware.
- **CRUD de vinilos**: crear, editar y eliminar discos con precio, estado, stock, descripción y tracklist.
- **Buscador automático de portada real** (por artista + título, vía iTunes/Deezer) o pegando una URL.
- **Gestión de artistas**: listado y alta.

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

Requisitos: **Node.js 18.18+** y npm.

```bash
npm install
cp .env.example .env          # Windows (PowerShell): copy .env.example .env
npm run db:push               # crea la base de datos SQLite
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

Las portadas (iTunes/Deezer), las fotos de artista (Wikipedia) y las del blog (Wikimedia Commons) se **descargaron y optimizaron a `/public`** (`/covers`, `/artists`, `/blog`). Así la app no depende de CDNs externos en tiempo de ejecución ni sufre límites de tasa. Para usar tus propias fotos, sustituye los archivos o, desde el panel admin, pega/busca una URL.

---

## ☁️ Desplegar en producción (Vercel + Neon)

SQLite es ideal en local, pero en *serverless* el sistema de archivos no persiste. Para desplegar con el panel admin funcionando, usa **PostgreSQL** (Neon tiene plan gratuito). Pasos:

1. **Sube el repo a GitHub** (ya hecho: `https://github.com/xoelgonzalezz/OceanBlvd`).
2. Crea una base de datos gratis en **[Neon](https://neon.tech)** y copia su *connection string* (`postgresql://…`).
3. En `prisma/schema.prisma`, cambia el `provider`:
   ```prisma
   datasource db {
     provider = "postgresql"   // antes: "sqlite"
     url      = env("DATABASE_URL")
   }
   ```
4. **Siembra la base de datos remota** desde tu equipo:
   ```bash
   # con DATABASE_URL apuntando a Neon (en tu .env o exportada)
   npm run db:push
   npm run db:seed
   ```
5. En **[Vercel](https://vercel.com/new)** importa el repo de GitHub y añade las variables de entorno:
   - `DATABASE_URL` → la de Neon
   - `ADMIN_PASSWORD` → una contraseña segura
   - `NEXT_PUBLIC_SITE_URL` → la URL pública (p. ej. `https://oceanblvd.vercel.app`)
6. **Deploy.** ¡Listo! Cada `git push` a `main` redeplega automáticamente.

> **Alternativa sin migrar (SQLite):** plataformas con disco persistente como **Railway** o **Render** permiten desplegar tal cual (sin cambiar el `provider`), montando un volumen para `prisma/dev.db`.

---

## 🗺️ Próximos pasos (roadmap)

- [ ] Pasarela de pago real (Stripe Checkout).
- [ ] Autenticación de clientes y área "Mis pedidos".
- [ ] Reseñas y valoraciones de discos.
- [ ] Subida de imágenes en el admin (Vercel Blob) en vez de URL.
- [ ] Wishlist y recomendaciones.
- [ ] Tests (unitarios + e2e) y CI.

---

Hecho con cariño por la música.
