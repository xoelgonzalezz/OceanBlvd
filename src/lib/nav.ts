/** Navegación principal (header). */
export const MAIN_NAV = [
  { label: "Tienda", href: "/tienda" },
  { label: "Artistas", href: "/artistas" },
  { label: "Blog", href: "/blog" },
  { label: "Nosotros", href: "/sobre-nosotros" },
] as const;

/** Columnas de enlaces del footer. */
export const FOOTER_NAV = [
  {
    title: "Tienda",
    links: [
      { label: "Novedades", href: "/tienda?sort=newest" },
      { label: "Más vendidos", href: "/tienda?sort=popular" },
      { label: "Segunda mano", href: "/tienda?condition=USED" },
      { label: "Todos los discos", href: "/tienda" },
    ],
  },
  {
    title: "Descubre",
    links: [
      { label: "Artistas", href: "/artistas" },
      { label: "Blog", href: "/blog" },
      { label: "Sobre nosotros", href: "/sobre-nosotros" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { label: "Envíos y devoluciones", href: "/envios" },
      { label: "Preguntas frecuentes", href: "/faq" },
      { label: "Contacto", href: "/contacto" },
    ],
  },
] as const;
