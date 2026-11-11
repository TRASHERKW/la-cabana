import Link from "next/link";
import { NewPasswordForm } from "@/components/ResetForms";

export const metadata = { title: "Nueva contraseña" };

export default async function RestablecerPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="container-lc grid min-h-[60vh] place-items-center py-16 text-center">
        <div>
          <h1 className="text-3xl text-madera-oscura">Falta el enlace</h1>
          <p className="mt-2 text-carbon/60">Abre el enlace completo que te llegó por correo.</p>
          <Link href="/recuperar" className="btn-primary mt-6">Pedir un enlace nuevo</Link>
        </div>
      </div>
    );
  }
  return <NewPasswordForm token={token} />;
}
