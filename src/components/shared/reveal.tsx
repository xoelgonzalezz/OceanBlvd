"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Retardo en segundos (útil para escalonar — stagger). */
  delay?: number;
  /** Desplazamiento vertical inicial en px. */
  y?: number;
}

/**
 * Aparición suave al entrar en el viewport (fade + translateY).
 * Curva de easing fuerte (Emil) y respeto a prefers-reduced-motion.
 */
export function Reveal({ children, className, delay = 0, y = 14 }: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
