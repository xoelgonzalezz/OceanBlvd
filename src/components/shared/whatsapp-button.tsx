import { getDict } from "@/i18n/server";

// Número de WhatsApp en formato internacional sin "+" ni espacios (p. ej.
// 34600112233). Si no está configurado, el botón no se muestra.
const RAW = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

/** Botón flotante de WhatsApp para dudas de preventa. */
export function WhatsAppButton() {
  const number = (RAW || "").replace(/[^0-9]/g, "");
  if (!number) return null;

  const t = getDict();
  const href = `https://wa.me/${number}?text=${encodeURIComponent(
    t.whatsapp.prefill
  )}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.whatsapp.aria}
      title={t.whatsapp.aria}
      className="fixed bottom-5 right-5 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-7 w-7"
        fill="currentColor"
        aria-hidden
      >
        <path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.9-.8-1.5-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35ZM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.57.93.96-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.43 9.44-9.43 2.52 0 4.89.98 6.67 2.77a9.37 9.37 0 0 1 2.76 6.67c0 5.2-4.24 9.43-9.42 9.43Zm8.03-17.46A11.36 11.36 0 0 0 12.05.7C5.8.7.72 5.78.72 12.02c0 2 .52 3.95 1.52 5.67L.62 23.3l5.75-1.5a11.32 11.32 0 0 0 5.67 1.44h.01c6.24 0 11.32-5.08 11.33-11.32a11.26 11.26 0 0 0-3.3-7.88Z" />
      </svg>
    </a>
  );
}
