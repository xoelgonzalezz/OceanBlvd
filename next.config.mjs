/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Permite servir nuestros placeholders SVG a través de next/image.
    // Cuando lleguen fotos reales, basta con añadir aquí sus dominios.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Permite imágenes reales de cualquier origen https (portadas iTunes/Deezer,
    // fotos de Wikipedia y URLs que añada el administrador).
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
