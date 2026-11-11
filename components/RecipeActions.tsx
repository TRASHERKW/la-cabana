"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleFavoriteAction } from "@/app/actions/recipes";

type Props = {
  recipeId: string;
  slug: string;
  initialSaved: boolean;
  avg: number;
  count: number;
  loggedIn: boolean;
};

/** Botón de guardar + resumen de calificación en el detalle de la receta. */
export default function RecipeActions({ recipeId, slug, initialSaved, avg, count, loggedIn }: Props) {
  const [saved, setSaved] = useState(initialSaved);
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();
  const loginHref = `/login?next=${encodeURIComponent(`/recetas/${slug}`)}`;

  const toggle = () =>
    start(async () => {
      const res = await toggleFavoriteAction(recipeId);
      if (res.ok) setSaved(res.saved);
      else setMsg(res.error);
    });

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        {loggedIn ? (
          <button onClick={toggle} disabled={pending} className={saved ? "btn-dark" : "btn-ghost"}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M6 3h12v18l-6-4-6 4V3Z" strokeLinejoin="round" />
            </svg>
            {saved ? "Guardada" : "Guardar receta"}
          </button>
        ) : (
          <Link href={loginHref} className="btn-ghost">Guardar receta</Link>
        )}
        <a href="#resenas" className="text-sm text-carbon/60 hover:text-brasa">
          <span className="text-amber-500">★</span>{" "}
          {count > 0 ? `${avg.toFixed(1)} · ${count} ${count === 1 ? "reseña" : "reseñas"}` : "Sin reseñas aún"}
        </a>
      </div>
      {msg && <p className="text-sm text-red-700">{msg}</p>}
    </div>
  );
}
