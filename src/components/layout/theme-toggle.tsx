"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { useT } from "@/components/i18n/locale-provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const t = useT();

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? t.header.toLight : t.header.toDark}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-foreground/80 hover:text-foreground"
    >
      {/* Evita el desajuste de hidratación: iconos neutros hasta montar. */}
      {mounted ? (
        isDark ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )
      ) : (
        <Sun className="h-5 w-5 opacity-0" />
      )}
    </Button>
  );
}
