"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartBadge() {
  const { count, ready } = useCart();
  return (
    <Link
      href="/carrito"
      aria-label="Ver carrito"
      className="relative grid h-10 w-10 place-items-center rounded-full text-madera transition hover:bg-madera/10"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      {ready && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brasa px-1 text-[11px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
