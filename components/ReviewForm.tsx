"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { rateRecipeAction } from "@/app/actions/recipes";

type Props = { recipeId: string; initialStars: number; initialComment: string };

const LABELS = ["", "No me gustó", "Regular", "Buena", "Muy buena", "¡Me encantó!"];

/** Formulario de reseña: estrellas (obligatorias) + comentario (opcional). */
export default function ReviewForm({ recipeId, initialStars, initialComment }: Props) {
  const [stars, setStars] = useState(initialStars);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(initialComment);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const editing = initialStars > 0;
  const shown = hover || stars;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stars) return setMsg({ ok: false, text: "Elige cuántas estrellas le das" });
    start(async () => {
      const res = await rateRecipeAction(recipeId, stars, comment);
      if (res.ok) {
        setMsg({ ok: true, text: editing ? "Reseña actualizada" : "¡Gracias por tu reseña!" });
        router.refresh();
      } else setMsg({ ok: false, text: res.error });
    });
  };

  return (
    <form onSubmit={submit} className="card space-y-3 p-5">
      <p className="font-display text-lg text-madera-oscura">{editing ? "Tu reseña" : "¿Ya la preparaste? Cuéntanos qué tal"}</p>
      <div className="flex items-center gap-3">
        <div className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onMouseEnter={() => setHover(i)}
              onClick={() => setStars(i)}
              aria-label={`${i} estrellas`}
              className={`px-0.5 text-3xl leading-none transition hover:scale-110 ${i <= shown ? "text-amber-500" : "text-carbon/20"}`}
            >
              ★
            </button>
          ))}
        </div>
        <span className="text-sm text-carbon/60">{LABELS[shown]}</span>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="Opcional: ¿le cambiaste algo? ¿qué tal quedó?"
        className="input"
      />
      {msg && <p className={`text-sm ${msg.ok ? "text-bosque" : "text-red-700"}`}>{msg.text}</p>}
      <button disabled={pending} className="btn-primary">{pending ? "Guardando…" : editing ? "Actualizar reseña" : "Publicar reseña"}</button>
    </form>
  );
}
