"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { generateRecipeAction, publishAIRecipeAction, type AIRecipe } from "@/app/actions/ai";
import RecipeForm from "./admin/RecipeForm";

const EXAMPLES = [
  "Tengo pollo, espinacas y queso panela",
  "Un desayuno alto en proteína sin huevo",
  "Postre sin azúcar con plátano",
  "Cena ligera en 20 minutos",
];

export default function AIGenerator({ loggedIn }: { loggedIn: boolean }) {
  const [prompt, setPrompt] = useState("");
  const [recipe, setRecipe] = useState<AIRecipe | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [generating, startGen] = useTransition();
  const [publishing, startPub] = useTransition();

  const generate = (text = prompt) => {
    setError("");
    setEditing(false);
    startGen(async () => {
      const res = await generateRecipeAction(text);
      if (res.ok) setRecipe(res.recipe);
      else setError(res.error);
    });
  };

  if (!loggedIn) {
    return (
      <div className="card p-8 text-center">
        <p className="text-4xl">👩‍🍳</p>
        <p className="mt-3 text-carbon/70">Para usar la IA necesitas una cuenta (es gratis).</p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/login?next=/ia" className="btn-dark">Iniciar sesión</Link>
          <Link href="/registro?next=/ia" className="btn-ghost">Crear cuenta</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          generate();
        }}
        className="card p-5"
      >
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Ej. Tengo atún, aguacate y tostadas, quiero algo rápido para la comida…"
          className="input !text-base"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setPrompt(ex);
                  generate(ex);
                }}
                disabled={generating}
                className="rounded-full border border-arena bg-papel px-3 py-1 text-xs text-carbon/70 hover:border-madera/40"
              >
                {ex}
              </button>
            ))}
          </div>
          <button disabled={generating || prompt.trim().length < 3} className="btn-primary">
            {generating ? "Cocinando idea…" : "✨ Generar receta"}
          </button>
        </div>
        {error && <p className="mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{error}</p>}
      </form>

      {generating && (
        <div className="card animate-pulse space-y-3 p-6">
          <div className="h-7 w-2/3 rounded bg-arena" />
          <div className="h-4 w-full rounded bg-arena/70" />
          <div className="h-4 w-5/6 rounded bg-arena/70" />
        </div>
      )}

      {recipe && !generating && !editing && (
        <article className="card overflow-hidden animate-rise">
          <div className="bg-madera p-6 text-crema">
            <p className="text-xs font-semibold uppercase tracking-wider text-paja/80">{recipe.category} · ✨ Hecha con IA</p>
            <h2 className="mt-1 text-3xl text-white">{recipe.title}</h2>
            {recipe.summary && <p className="mt-2 text-crema/80">{recipe.summary}</p>}
            <p className="mt-3 text-sm text-crema/70">⏱ {recipe.prepMinutes} min · 🍽 {recipe.servings} porciones · {recipe.difficulty}</p>
          </div>
          <div className="grid gap-8 p-6 md:grid-cols-[1fr_1.5fr]">
            <div>
              <h3 className="text-xl text-madera-oscura">Ingredientes</h3>
              <ul className="mt-3 space-y-2 text-sm text-carbon/80">
                {recipe.ingredients.map((i, k) => (
                  <li key={k} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brasa" />{i}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl text-madera-oscura">Preparación</h3>
              <ol className="mt-3 space-y-3 text-sm text-carbon/80">
                {recipe.steps.map((s, k) => (
                  <li key={k} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-madera text-xs text-crema">{k + 1}</span>
                    <span className="pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 border-t border-arena bg-paja/40 p-5">
            <button
              onClick={() => startPub(async () => { await publishAIRecipeAction(recipe); })}
              disabled={publishing}
              className="btn-primary"
            >
              {publishing ? "Publicando…" : "Publicar en mi recetario"}
            </button>
            <button onClick={() => setEditing(true)} className="btn-ghost">Editar y agregar foto</button>
            <button onClick={() => generate()} className="btn text-carbon/60 hover:text-madera" disabled={generating}>↻ Otra idea</button>
          </div>
        </article>
      )}

      {recipe && editing && (
        <div className="animate-rise">
          <h2 className="mb-4 text-2xl text-madera-oscura">Ajusta tu receta antes de publicarla</h2>
          <RecipeForm recipe={{ ...recipe, fromAI: true }} cancelHref="/ia" />
        </div>
      )}
    </div>
  );
}
