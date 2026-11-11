"use server";

import { Types } from "mongoose";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { getSession, requireUser } from "@/lib/auth";
import { lines } from "@/lib/validation";
import { recipeSchema, uniqueSlug } from "@/lib/recipe-helpers";
import { Recipe } from "@/models/Recipe";
import { User } from "@/models/User";

export type RecipeFormState = { error?: string } | undefined;

/** Crea o edita una receta propia (cualquier usuario con sesión). */
export async function saveMyRecipeAction(_prev: RecipeFormState, formData: FormData): Promise<RecipeFormState> {
  const session = await requireUser();
  const parsed = recipeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const ingredients = lines(formData.get("ingredients"));
  const steps = lines(formData.get("steps"));
  if (!ingredients.length) return { error: "Agrega al menos un ingrediente" };
  if (!steps.length) return { error: "Agrega al menos un paso" };

  await connectDB();
  const id = String(formData.get("id") ?? "");
  const data = { ...parsed.data, ingredients, steps, fromAI: formData.get("fromAI") === "1" };

  let slug: string;
  if (id) {
    if (!Types.ObjectId.isValid(id)) return { error: "ID inválido" };
    const recipe = await Recipe.findById(id);
    if (!recipe) return { error: "La receta ya no existe" };
    if (recipe.author?.toString() !== session.id && session.role !== "admin") return { error: "Solo puedes editar tus recetas" };
    slug = await uniqueSlug(Recipe, data.title, id);
    await Recipe.updateOne({ _id: id }, { ...data, slug });
  } else {
    slug = await uniqueSlug(Recipe, data.title);
    await Recipe.create({ ...data, slug, author: session.id, published: true });
  }
  revalidatePath("/", "layout");
  redirect(`/recetas/${slug}`);
}

export async function deleteMyRecipeAction(formData: FormData) {
  const session = await requireUser();
  const id = String(formData.get("id"));
  if (!Types.ObjectId.isValid(id)) return;
  await connectDB();
  const filter = session.role === "admin" ? { _id: id } : { _id: id, author: session.id };
  const res = await Recipe.deleteOne(filter);
  if (res.deletedCount) await User.updateMany({}, { $pull: { favorites: id } });
  revalidatePath("/", "layout");
  redirect("/tus-recetas");
}

export type RateResult = { ok: true; avg: number; count: number; mine: number } | { ok: false; error: string; needsLogin?: boolean };

function recalc(recipe: { ratings: { stars: number }[]; ratingCount: number; ratingAvg: number }) {
  recipe.ratingCount = recipe.ratings.length;
  recipe.ratingAvg = recipe.ratingCount
    ? Math.round((recipe.ratings.reduce((n, r) => n + r.stars, 0) / recipe.ratingCount) * 10) / 10
    : 0;
}

/** Califica una receta de 1 a 5 estrellas con reseña opcional. Un voto por usuario (se puede editar). */
export async function rateRecipeAction(recipeId: string, stars: number, comment = ""): Promise<RateResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Inicia sesión para calificar", needsLogin: true };
  if (!Types.ObjectId.isValid(recipeId) || !Number.isInteger(stars) || stars < 1 || stars > 5) return { ok: false, error: "Elige de 1 a 5 estrellas" };
  const text = String(comment ?? "").trim();
  if (text.length > 1000) return { ok: false, error: "La reseña puede tener máximo 1000 caracteres" };

  await connectDB();
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) return { ok: false, error: "La receta ya no existe" };
  if (recipe.author?.toString() === session.id) return { ok: false, error: "No puedes calificar tu propia receta" };

  const existing = recipe.ratings.find((r) => r.user.toString() === session.id);
  if (existing) {
    existing.stars = stars;
    existing.comment = text;
  } else {
    recipe.ratings.push({ user: new Types.ObjectId(session.id), stars, comment: text });
  }
  recalc(recipe);
  await recipe.save();
  revalidatePath(`/recetas/${recipe.slug}`);
  return { ok: true, avg: recipe.ratingAvg, count: recipe.ratingCount, mine: stars };
}

/** Borra una reseña: la tuya, o cualquiera si eres admin. */
export async function deleteReviewAction(formData: FormData) {
  const session = await requireUser();
  const recipeId = String(formData.get("recipeId"));
  const userId = String(formData.get("userId"));
  if (!Types.ObjectId.isValid(recipeId) || !Types.ObjectId.isValid(userId)) return;
  if (userId !== session.id && session.role !== "admin") return;

  await connectDB();
  const recipe = await Recipe.findById(recipeId);
  if (!recipe) return;
  recipe.set("ratings", recipe.ratings.filter((r) => r.user.toString() !== userId));
  recalc(recipe);
  await recipe.save();
  revalidatePath(`/recetas/${recipe.slug}`);
}

export type FavResult = { ok: true; saved: boolean } | { ok: false; error: string; needsLogin?: boolean };

/** Guarda / quita una receta de "Tus recetas → Guardadas". */
export async function toggleFavoriteAction(recipeId: string): Promise<FavResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Inicia sesión para guardar recetas", needsLogin: true };
  if (!Types.ObjectId.isValid(recipeId)) return { ok: false, error: "Receta inválida" };

  await connectDB();
  const user = await User.findById(session.id, "favorites");
  if (!user) return { ok: false, error: "Usuario no encontrado", needsLogin: true };

  const saved = user.favorites.some((f) => f.toString() === recipeId);
  await User.updateOne({ _id: session.id }, saved ? { $pull: { favorites: recipeId } } : { $addToSet: { favorites: recipeId } });
  revalidatePath("/tus-recetas");
  return { ok: true, saved: !saved };
}
