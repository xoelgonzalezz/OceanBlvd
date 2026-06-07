import { Asterisk } from "lucide-react";

/**
 * Banda de texto en marquesina (desplazamiento continuo).
 * Se duplica el contenido para un bucle sin saltos; se pausa al pasar el ratón.
 */
export function Marquee({ items }: { items: string[] }) {
  return (
    <div className="mask-fade-x overflow-hidden border-y border-border bg-card py-4">
      <div className="flex w-max animate-marquee pause-on-hover">
        {[0, 1].map((dup) => (
          <ul
            key={dup}
            className="flex shrink-0 items-center"
            aria-hidden={dup === 1}
          >
            {items.map((item, i) => (
              <li key={i} className="flex items-center">
                <span className="px-4 font-serif text-xl font-medium uppercase tracking-tight sm:px-6 sm:text-2xl">
                  {item}
                </span>
                <Asterisk className="h-4 w-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
