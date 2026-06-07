import { Disc3 } from "lucide-react";

import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-sm rounded-lg border bg-card p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Disc3 className="h-8 w-8" />
          <h1 className="mt-3 font-serif text-2xl font-semibold">
            Panel de administración
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Introduce la contraseña para gestionar el catálogo.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
