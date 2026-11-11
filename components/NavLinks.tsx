"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Barra de navegación con la sección actual resaltada. */
export default function NavLinks({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <ul className="container-lc flex h-11 items-center justify-center gap-9 text-[15px]">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              className={`relative py-3 font-semibold transition hover:text-madera ${active ? "text-madera" : "text-carbon/70"}`}
            >
              {l.label}
              {active && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-madera" />}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
