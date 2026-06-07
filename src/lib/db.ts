import { PrismaClient } from "@prisma/client";

// Cliente Prisma como singleton para evitar múltiples conexiones en desarrollo
// (Next.js recarga módulos en caliente y crearía un cliente nuevo en cada cambio).
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
