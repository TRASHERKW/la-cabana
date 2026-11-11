/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getSession } from "@/lib/auth";
import CartBadge from "./CartBadge";
import MobileMenu from "./MobileMenu";
import NavLinks from "./NavLinks";
import { logoutAction } from "@/app/actions/auth";

export const NAV_LINKS = [
  { href: "/recetas", label: "Recetas" },
  { href: "/blog", label: "Blog de consejos" },
  { href: "/ia", label: "Receta con IA" },
  { href: "/tienda", label: "Tienda" },
  { href: "/tus-recetas", label: "Tus recetas" },
];

export default async function Header() {
  const session = await getSession();
  const links = session?.role === "admin" ? [...NAV_LINKS, { href: "/admin", label: "Panel admin" }] : NAV_LINKS;

  return (
    <header className="sticky top-0 z-40 shadow-[0_1px_0_rgba(90,42,42,0.12)]">
      <div className="bg-arena/95 backdrop-blur">
        <div className="container-lc flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="font-display text-2xl text-madera-oscura">La Cabaña</span>
            <img src="/img/cabana-icono.png" alt="" className="hidden h-7 w-7 opacity-80 sm:block" />
          </Link>

          <div className="flex items-center gap-1.5">
            <CartBadge />
            <div className="hidden items-center gap-2 md:flex">
              {session ? (
                <>
                  <Link href="/cuenta" className="btn-ghost !px-4 !py-2">
                    Hola, {session.name.split(" ")[0]}
                  </Link>
                  <form action={logoutAction}>
                    <button className="px-2 text-sm text-carbon/60 hover:text-brasa">Salir</button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="btn-dark !px-5 !py-2">
                  Iniciar sesión
                </Link>
              )}
            </div>
            <MobileMenu links={links} session={session} logout={logoutAction} />
          </div>
        </div>
      </div>
      <nav className="hidden bg-paja/95 backdrop-blur md:block">
        <NavLinks links={links} />
      </nav>
    </header>
  );
}

export function Logo({ className = "h-10 w-10" }: { className?: string }) {
  return <img src="/img/logo.png" alt="Logo de La Cabaña" className={`${className} object-contain`} />;
}
