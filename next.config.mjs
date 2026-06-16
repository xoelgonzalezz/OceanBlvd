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
    // Hosts de imágenes permitidos (evita SSRF por el optimizador con "**").
    remotePatterns: [
      { protocol: "https", hostname: "*.mzstatic.com" }, // iTunes / Apple Music
      { protocol: "https", hostname: "*.dzcdn.net" }, // Deezer
      { protocol: "https", hostname: "upload.wikimedia.org" }, // Wikipedia
      { protocol: "https", hostname: "*.scdn.co" }, // Spotify (por si acaso)
      { protocol: "https", hostname: "m.media-amazon.com" }, // Amazon (portadas pegadas a mano)
      { protocol: "https", hostname: "images-na.ssl-images-amazon.com" }, // Amazon (variante)
      { protocol: "https", hostname: "i.discogs.com" }, // Discogs
      { protocol: "https", hostname: "coverartarchive.org" }, // Cover Art Archive (MusicBrainz)
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
