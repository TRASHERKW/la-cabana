"use client";

import Link from "next/link";
import { useActionState } from "react";
import { saveRecipeAction } from "@/app/actions/admin";
import { saveMyRecipeAction } from "@/app/actions/recipes";
import { RECIPE_CATEGORIES } from "@/lib/utils";
import ImageInput from "@/components/ImageInput";

export type RecipeFormData = {
  _id?: string;
  title?: string;
  summary?: string;
  category?: string;
  image?: string;
  prepMinutes?: number;
  servings?: number;
  difficulty?: string;
  ingredients?: string[];
  steps?: string[];
  products?: string[];
  published?: boolean;
  fromAI?: boolean;
};

type Props = {
  recipe?: RecipeFormData;
  /** "admin" muestra productos relacionados y publicar/ocultar. */
  mode?: "admin" | "user";
  products?: { _id: string; name: string }[];
  cancelHref?: string;
};

export default function RecipeForm({ recipe, mode = "user", products = [], cancelHref }: Props) {
  const [state, action, pending] = useActionState(mode === "admin" ? saveRecipeAction : saveMyRecipeAction, undefined);
  const selected = new Set(recipe?.products ?? []);
  const cancel = cancelHref ?? (mode === "admin" ? "/admin/recetas" : "/tus-recetas");

  return (
    <form action={action} className="card max-w-3xl space-y-5 p-6">
      {recipe?._id && <input type="hidden" name="id" value={recipe._id} />}
      {recipe?.fromAI && <input type="hidden" name="fromAI" value="1" />}
      <div>
        <label className="label" htmlFor="title">Nombre de la receta</label>
        <input id="title" name="title" required minLength={3} defaultValue={recipe?.title} className="input" placeholder="Ej. Tacos de birria" />
      </div>
      <div>
        <label className="label" htmlFor="summary">Descripción corta</label>
        <textarea id="summary" name="summary" rows={2} maxLength={500} defaultValue={recipe?.summary} className="input" placeholder="¿Por qué la van a amar?" />
      </div>
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label className="label" htmlFor="category">Categoría</label>
          <select id="category" name="category" defaultValue={recipe?.category ?? RECIPE_CATEGORIES[0]} className="input">
            {RECIPE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="prepMinutes">Minutos</label>
          <input id="prepMinutes" name="prepMinutes" type="number" min="0" required defaultValue={recipe?.prepMinutes ?? 30} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="servings">Porciones</label>
          <input id="servings" name="servings" type="number" min="1" required defaultValue={recipe?.servings ?? 4} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="difficulty">Dificultad</label>
          <select id="difficulty" name="difficulty" defaultValue={recipe?.difficulty ?? "Fácil"} className="input">
            <option>Fácil</option>
            <option>Media</option>
            <option>Difícil</option>
          </select>
        </div>
      </div>

      <ImageInput name="image" defaultValue={recipe?.image} label="Foto del platillo" />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label" htmlFor="ingredients">Ingredientes <span className="text-carbon/40">(uno por línea)</span></label>
          <textarea
            id="ingredients"
            name="ingredients"
            rows={9}
            required
            defaultValue={recipe?.ingredients?.join("\n")}
            className="input"
            placeholder={"2 tazas de espinaca\n1 pechuga de pollo\nSal y pimienta"}
          />
        </div>
        <div>
          <label className="label" htmlFor="steps">Pasos <span className="text-carbon/40">(uno por línea)</span></label>
          <textarea
            id="steps"
            name="steps"
            rows={9}
            required
            defaultValue={recipe?.steps?.join("\n")}
            className="input"
            placeholder={"Lava y pica la espinaca.\nSazona el pollo y cocínalo 6 min por lado."}
          />
        </div>
      </div>

      {mode === "admin" && products.length > 0 && (
        <fieldset>
          <legend className="label">Productos de la tienda usados en la receta</legend>
          <div className="grid max-h-48 gap-2 overflow-y-auto rounded-xl border border-arena bg-papel p-3 sm:grid-cols-2">
            {products.map((p) => (
              <label key={p._id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="products" value={p._id} defaultChecked={selected.has(p._id)} className="h-4 w-4 accent-brasa" />
                {p.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {mode === "admin" && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="published" defaultChecked={recipe?.published ?? true} className="h-4 w-4 accent-brasa" />
          Publicada (visible para todos)
        </label>
      )}

      {state?.error && <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">{state.error}</p>}

      <div className="flex gap-3">
        <button disabled={pending} className="btn-primary">{pending ? "Guardando…" : recipe?._id ? "Guardar cambios" : "Publicar receta"}</button>
        <Link href={cancel} className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
