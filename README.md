# Ocean Blvd Vinyl 🎶

Tienda de comercio electrónico de **discos de vinilo**, moderna, elegante y totalmente funcional. Estilo editorial premium (paleta terracota / crema), modo claro y oscuro, microinteracciones cuidadas y datos de ejemplo realistas para verla funcionando desde el primer momento.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-5-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8)

---

## ✨ Características

- **Home** con hero animado, últimas novedades, más vendidos, géneros, artistas destacados y avance del blog.
- **Catálogo** con filtros (género, artista, década, rango de precio, estado), ordenación, buscador y paginación — todo sincronizado con la URL.
- **Ficha de producto** con galería (portada/contraportada), tracklist completo, estado (Mint, VG+…), sello, año y productos relacionados.
- **Carrito** persistente (Zustand + `localStorage`) con cajón lateral, y **checkout** con cálculo de envío y **pago simulado** (crea un pedido real en la base de datos).
- **Artistas** (listado + ficha con biografía y discografía) y **Blog/Noticias** (listado + artículo).
- **Páginas estáticas**: Sobre nosotros, Contacto (con formulario), FAQ y Política de envíos.
- **Buscador global** tipo command palette (`⌘K` / `Ctrl+K`).
- **Modo oscuro**, diseño **responsive**, SEO (metadatos por página, Open Graph, `sitemap.xml`, `robots.txt`) y accesibilidad (HTML semántico, `alt`, foco visible, `prefers-reduced-motion`).

## 🧱 Stack

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui (Radix UI) |
| Base de datos | SQLite + Prisma (migrable a PostgreSQL) |
| Estado del carrito | Zustand (con persistencia) |
| Animaciones | Framer Motion + CSS (curvas de easing a medida) |
| Validación | Zod |
| Iconos | lucide-react · Toasts: Sonner |

## 🚀 Puesta en marcha

Requisitos: **Node.js 18.18+** y npm.

```bash
# 1. Instalar dependencias
npm install

# 2. Crear el archivo de entorno
cp .env.example .env        # en Windows (PowerShell): copy .env.example .env

# 3. Crear la base de datos SQLite y cargar los datos de ejemplo
npm run db:push
npm run db:seed

# 4. Arrancar en desarrollo
npm run dev
```

Abre **http://localhost:3000** 🎉

> El archivo `.env` define `DATABASE_URL="file:./dev.db"`. La base de datos (`prisma/dev.db`) se genera localmente y no se versiona.

## 📜 Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción (genera el cliente de Prisma) |
| `npm run start` | Servir el build de producción |
| `npm run lint` | Linter |
| `npm run db:push` | Sincroniza el esquema con la base de datos SQLite |
| `npm run db:seed` | Carga los datos de ejemplo |
| `npm run db:reset` | Reinicia la base de datos y vuelve a sembrarla |
| `npm run db:studio` | Abre Prisma Studio |

## 📁 Estructura

```
prisma/
  schema.prisma            # Modelos (Genre, Artist, Record, Track, Order, BlogPost...)
  seed.ts                  # Script de semilla
  seed-data.json           # Datos realistas (artistas, discos, tracklists, blog)
  generate-placeholders.mjs# Generador de portadas SVG de relleno
public/placeholders/       # Imágenes placeholder (portadas, artistas, blog)
src/
  app/
    (shop)/                # Grupo con Header + Footer
      page.tsx             # Home
      tienda/              # Catálogo
      producto/[slug]/     # Ficha de producto
      artistas/            # Artistas (listado + [slug])
      blog/                # Blog (listado + [slug])
      carrito/ · checkout/ # Carrito y checkout (+ /checkout/exito)
      sobre-nosotros/ · contacto/ · faq/ · envios/
    api/                   # checkout · contact · newsletter · search
    layout.tsx · sitemap.ts · robots.ts · not-found.tsx
  components/
    ui/                    # Primitivas shadcn/ui
    layout/ · home/ · shop/ · product/ · cart/ · checkout/ · contact/ · shared/
  lib/                     # db, queries, utils, constants, validators, nav, mappers
  store/cart.ts            # Estado del carrito (Zustand)
  types/                   # Tipos compartidos
```

## 🗄️ Modelo de datos (resumen)

- **Genre** → **Artist** → **Record** (disco) con **RecordImage** y **Track**.
- **Record**: precio en céntimos (`priceCents`), `condition` (NEW/USED), `mediaGrade` (M/NM/VG+…), `decade`, `salesCount`, `featured`.
- **Order** + **OrderItem** para los pedidos del checkout.
- **BlogPost**, **NewsletterSubscriber**, **ContactMessage**.

## 🔄 Migrar a PostgreSQL

1. Cambia `provider = "postgresql"` en `prisma/schema.prisma`.
2. Ajusta `DATABASE_URL` en `.env` con tu cadena de conexión.
3. Ejecuta `npm run db:push && npm run db:seed`.

Los modelos no usan tipos exclusivos de SQLite, así que la migración es directa.

## 📝 Notas

- La **pasarela de pago está simulada**: el checkout valida y crea un pedido real en la base de datos, pero no realiza ningún cargo. Integrar Stripe (u otra) sería el siguiente paso.
- Las **imágenes son placeholders SVG** generados a medida. Para usar fotos reales, sustituye las URLs en el seed (o añade el dominio en `next.config.mjs`).

---

Hecho con cariño por la música. 🖤
