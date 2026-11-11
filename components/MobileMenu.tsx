"use client";

import Link from "next/link";
import { useState } from "react";
import type { Session } from "@/lib/auth";

type Props = {
  links: { href: string; label: string }[];
  session: Session | null;
  logout: () => Promise<void>;
};

export default function MobileMenu({ links, session, logout }: Props) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="grid h-10 w-10 place-items-center rounded-full text-madera hover:bg-madera/10"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <div className="absolute inset-x-0 top-16 max-h-[calc(100vh-4rem)] overflow-y-auto border-b border-arena bg-paja px-5 pb-5 pt-2 shadow-lg">
          <nav className="flex flex-col gap-1 text-base font-medium">
            {links.map((l) => (
              <Link key={l.href} href={l.href} onClick={close} className="rounded-lg px-3 py-2.5 hover:bg-madera/10">
                {l.label}
              </Link>
            ))}
            {session ? (
              <>
                <Link href="/cuenta" onClick={close} className="rounded-lg px-3 py-2.5 hover:bg-madera/10">
                  Mi cuenta
                </Link>
                <form action={logout}>
                  <button className="w-full rounded-lg px-3 py-2.5 text-left text-carbon/60 hover:bg-madera/10">Cerrar sesión</button>
                </form>
              </>
            ) : (
              <Link href="/login" onClick={close} className="btn-dark mt-2">
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
