/** @type {import('next').NextConfig} */

// Política de seguridad de contenido (CSP) razonable para esta app.
// 'unsafe-inline' en script/style es necesario por el script de next-themes y
// los estilos inline (transforms, gradientes). El resto queda bloqueado.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // SVG solo para nuestros placeholders locales; el optimizador va en sandbox.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Se permite cualquier host HTTPS: el dueño pega URLs de imágenes desde el
    // admin y quiere poder usar cualquier dominio. (Solo el admin define estas
    // URLs, así que el riesgo del optimizador es asumible para esta tienda.)
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Redirección www → dominio raíz (canónico). OJO: esto SOLO actúa una vez que
  // el subdominio www tiene certificado SSL válido (se añade en Vercel). Si el
  // certificado de www no existe, el navegador falla antes y ninguna redirección
  // de código puede ejecutarse: primero hay que añadir www en Vercel.
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.oceanblvdvinyl.com" }],
        destination: "https://oceanblvdvinyl.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
